import argparse
import logging
import json
import sys
import time
import urllib.request
import urllib.parse
import traceback
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import credentials, firestore


# 英雄 clashId 映射，需与前端保持一致
HERO_CLASH_IDS: Dict[str, int] = {
    "Barbarian King": 0,
    "Archer Queen": 1,
    "Grand Warden": 2,
    "Royal Champion": 4,
    "Minion Prince": 6,
}


def http_get_json(url: str, timeout: int = 30) -> Any:
    logging.debug(f"HTTP GET {url}")
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        if resp.status != 200:
            raise RuntimeError(f"GET {url} failed with status {resp.status}")
        raw = resp.read().decode("utf-8")
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            raise RuntimeError(f"Invalid JSON from {url}: {raw[:200]}")


def unit_icon_name(unit_name: str) -> str:
    # 前端小图路径约定：/units/{name}_small.webp
    return f"units/{unit_name}_small.webp"


def hero_icon_name(hero_name: str) -> str:
    # 前端英雄卡片：/heroes/{name}.webp
    return f"heroes/{hero_name}.webp"


def pet_icon_name(pet_name: str) -> str:
    # 前端宠物图：/heroes/pets/{name}.webp
    return f"heroes/pets/{pet_name}.webp"


def equipment_icon_name(equipment_name: str) -> str:
    # 前端装备小图：/heroes/equipment/{name}_small.webp
    return f"heroes/equipment/{equipment_name}_small.webp"


def build_heroes_from_assets(pets: List[Dict[str, Any]], equipment: List[Dict[str, Any]]):
    # 根据宠物和装备推导使用到的英雄集合，并组合每个英雄的宠物和最多两件装备
    by_hero: Dict[str, Dict[str, Any]] = {}
    for eq in equipment or []:
        hero = eq.get("hero")
        if not hero:
            continue
        h = by_hero.setdefault(hero, {})
        h.setdefault("equipment", []).append(eq)

    for p in pets or []:
        hero = p.get("hero")
        if not hero:
            continue
        h = by_hero.setdefault(hero, {})
        # 只取一个宠物（与前端生成逻辑一致）
        if "pet" not in h:
            h["pet"] = p

    result: List[Dict[str, Any]] = []
    for hero_name, data in by_hero.items():
        entry: Dict[str, Any] = {
            "name": hero_name,
            "icon": hero_icon_name(hero_name),
            "clashId": HERO_CLASH_IDS.get(hero_name),
        }
        if data.get("pet"):
            entry["pet"] = {
                "name": data["pet"].get("name"),
                "clashId": data["pet"].get("clashId"),
                "icon": pet_icon_name(data["pet"].get("name")),
            }
        eq_list = data.get("equipment") or []
        if eq_list:
            # 最多两件，保持原顺序
            entry["equipment"] = [
                {
                    "name": e.get("name"),
                    "clashId": e.get("clashId"),
                    "icon": equipment_icon_name(e.get("name")),
                }
                for e in eq_list[:2]
            ]
        result.append(entry)
    return result


def split_units(army_units: List[Dict[str, Any]]):
    camp = {"troops": [], "spells": [], "siges": [], "sieges": []}
    cc = {"troops": [], "spells": [], "siges": [], "sieges": []}

    def to_entry(u: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "name": u.get("name"),
            "type": u.get("type"),
            "amount": u.get("amount"),
            "clashId": u.get("clashId"),
            "icon": unit_icon_name(u.get("name")),
        }

    for u in army_units or []:
        home = u.get("home")
        bucket = cc if home == "clanCastle" else camp
        if u.get("type") == "Spell":
            bucket["spells"].append(to_entry(u))
        elif u.get("type") == "Siege":
            bucket["sieges"].append(to_entry(u))
        else:
            bucket["troops"].append(to_entry(u))

    return camp, cc


def generate_copy_link(army: Dict[str, Any]) -> str:
    # 复刻前端 generateLink 逻辑
    def build_units_str(units: List[Dict[str, Any]]) -> str:
        parts = [f"{int(u.get('amount', 0))}x{int(u.get('clashId'))}" for u in units if u.get("clashId") is not None]
        return "-".join(parts)

    # 构建英雄段：从 equipment/pets 推导
    pets: List[Dict[str, Any]] = army.get("pets") or []
    equipment: List[Dict[str, Any]] = army.get("equipment") or []
    by_hero: Dict[str, Dict[str, Any]] = {}
    for eq in equipment:
        hero = eq.get("hero")
        if not hero:
            continue
        h = by_hero.setdefault(hero, {})
        h.setdefault("eq", []).append(eq)
    for p in pets:
        hero = p.get("hero")
        if not hero:
            continue
        h = by_hero.setdefault(hero, {})
        if "pet" not in h:
            h["pet"] = p

    heroes_segment = ""
    if by_hero:
        hero_parts: List[str] = []
        for hero_name, data in by_hero.items():
            base = str(HERO_CLASH_IDS.get(hero_name))
            if not base or base == "None":
                continue
            if data.get("pet") and data["pet"].get("clashId") is not None:
                base += f"p{int(data['pet']['clashId'])}"
            eqs = data.get("eq") or []
            if eqs:
                base += f"e{int(eqs[0].get('clashId'))}"
                if len(eqs) > 1 and eqs[1].get("clashId") is not None:
                    base += f"_{int(eqs[1]['clashId'])}"
            hero_parts.append(base)
        if hero_parts:
            heroes_segment = "h" + "-".join(hero_parts)

    # 分桶部队
    units: List[Dict[str, Any]] = army.get("units") or []
    cc_troops = [u for u in units if u.get("home") == "clanCastle" and u.get("type") in ("Troop", "Siege")]
    cc_spells = [u for u in units if u.get("home") == "clanCastle" and u.get("type") == "Spell"]
    camp_troops = [u for u in units if u.get("home") == "armyCamp" and u.get("type") in ("Troop", "Siege")]
    camp_spells = [u for u in units if u.get("home") == "armyCamp" and u.get("type") == "Spell"]

    parts: List[str] = []
    if heroes_segment:
        parts.append(heroes_segment)
    if cc_troops:
        parts.append("i" + build_units_str(cc_troops))
    if cc_spells:
        parts.append("d" + build_units_str(cc_spells))
    if camp_troops:
        parts.append("u" + build_units_str(camp_troops))
    if camp_spells:
        parts.append("s" + build_units_str(camp_spells))

    return "https://link.clashofclans.com/?action=CopyArmy&army=" + "".join(parts)


def transform_army(army: Dict[str, Any]) -> Dict[str, Any]:
    camp, cc = split_units(army.get("units") or [])
    heroes = build_heroes_from_assets(army.get("pets") or [], army.get("equipment") or [])
    copy_link = generate_copy_link(army)

    doc: Dict[str, Any] = {
        "id": army.get("id"),
        "name": army.get("name"),
        "townHall": army.get("townHall"),
        "banner": army.get("banner"),
        "tags": army.get("tags") or [],
        "createdByUsername": army.get("username"),
        "createdTime": army.get("createdTime"),
        "updatedTime": army.get("updatedTime"),
        "metrics": {
            "score": army.get("score") or 0,
            "votes": army.get("votes") or 0,
            "pageViews": army.get("pageViews") or 0,
            "openLinkClicks": army.get("openLinkClicks") or 0,
            "copyLinkClicks": army.get("copyLinkClicks") or 0,
        },
        "composition": {
            "armyCamp": camp,
            "clanCastle": cc,
            "heroes": heroes,
        },
        "copyLink": copy_link,
    }
    return doc


def _parse_dt(value: Optional[str]) -> Optional[float]:
    if not value:
        return None
    # 返回 epoch 秒（float），便于比较
    try:
        # 兼容带 'Z' 的 ISO 字符串
        if isinstance(value, str) and value.endswith('Z'):
            value = value.replace('Z', '+00:00')
        from datetime import datetime
        dt = datetime.fromisoformat(value)  # 支持 'YYYY-MM-DDTHH:MM:SS.sss+00:00'
        return dt.timestamp()
    except Exception:
        logging.debug(f"Failed to parse datetime: {value}")
        return None


def _filter_armies_since(armies: List[Dict[str, Any]], since_iso: Optional[str]) -> List[Dict[str, Any]]:
    if not since_iso:
        return armies
    since_ts = _parse_dt(since_iso)
    if since_ts is None:
        logging.warning(f"--since provided but unparsable: {since_iso}, ignoring filter.")
        return armies
    filtered: List[Dict[str, Any]] = []
    for a in armies:
        ts = _parse_dt(a.get('updatedTime')) or _parse_dt(a.get('createdTime'))
        if ts is None:
            continue
        if ts >= since_ts:
            filtered.append(a)
    return filtered


def _max_updated_iso(armies: List[Dict[str, Any]]) -> Optional[str]:
    max_ts = -1.0
    max_iso = None
    for a in armies:
        for k in ('updatedTime', 'createdTime'):
            ts = _parse_dt(a.get(k))
            if ts is not None and ts > max_ts:
                max_ts = ts
                max_iso = a.get(k)
    return max_iso


def _load_state_since(state_file: Optional[str]) -> Optional[str]:
    if not state_file:
        return None
    try:
        with open(state_file, 'r', encoding='utf-8') as f:
            iso = f.read().strip()
            return iso or None
    except FileNotFoundError:
        return None
    except Exception as e:
        logging.warning(f"Failed to read state file '{state_file}': {e}")
        return None


def _save_state_since(state_file: Optional[str], iso_value: Optional[str]) -> None:
    if not state_file or not iso_value:
        return
    try:
        with open(state_file, 'w', encoding='utf-8') as f:
            f.write(iso_value)
        logging.info(f"Saved watermark to state file: {state_file} -> {iso_value}")
    except Exception as e:
        logging.warning(f"Failed to write state file '{state_file}': {e}")


def upload_armies(
    base_url: str,
    service_account: str,
    collection: str = "armies",
    dry_run: bool = False,
    batch_size: int = 400,
    since: Optional[str] = None,
    state_file: Optional[str] = None,
    skip_not_newer: bool = False,
    fs_migration: bool = True,
    migration_collection: str = "migration",
    migration_doc: str = "cocarmies",
    init_migration: bool = False,
) -> Tuple[int, int, int]:
    # 初始化 Firebase
    logging.info(f"Initializing Firebase app with service account: {service_account}")
    cred = credentials.Certificate(service_account)
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(cred)
    db = firestore.client()

    export_url = base_url.rstrip("/") + "/api/export/armies"
    logging.info(f"Fetching armies from: {export_url}")
    armies = http_get_json(export_url)
    if not isinstance(armies, list):
        raise RuntimeError("Exported armies JSON is not a list")

    # since/state_file/Firestore migration 处理
    watermark = None
    # Firestore migration 优先，其次本地 state_file
    fs_marker: Optional[Dict[str, Any]] = None
    if fs_migration:
        try:
            marker_ref = db.collection(migration_collection).document(migration_doc)
            snap = marker_ref.get()
            if snap.exists:
                fs_marker = snap.to_dict() or {}
                logging.info(f"Loaded Firestore migration marker: {fs_marker}")
            else:
                fs_marker = None
        except Exception as e:
            logging.error(f"Failed to load Firestore migration marker: {e}")
            logging.debug(traceback.format_exc())
            fs_marker = None

        if init_migration:
            # 初始化：写入当前导出集的最新水位线，不执行上传
            max_iso = _max_updated_iso(armies)
            # 若相同时间有多条，选择最大的 id 作为最后游标
            last_id = -1
            if max_iso is not None:
                # 找到该时间的最大 id
                candidates = []
                for a in armies:
                    iso = a.get('updatedTime') or a.get('createdTime')
                    if iso == max_iso:
                        candidates.append(int(a.get('id', -1)))
                last_id = max(candidates) if candidates else -1
            marker_payload = {
                'lastUpdatedTime': max_iso,
                'lastId': last_id,
                'lastRunAt': datetime.now(timezone.utc).isoformat(),
                'note': 'Initialized without uploading. Future runs will sync newer only.'
            }
            marker_ref.set(marker_payload, merge=True)
            logging.info(f"Initialized Firestore migration marker at {migration_collection}/{migration_doc}: {marker_payload}")
            return len(armies), 0, 0

        # 若启用 Firestore migration 但没有 marker，且未显式指定 since，则拒绝上传
        if fs_marker is None and not since:
            logging.error(
                "Firestore migration marker not found. Refusing to upload. "
                f"Create it first using --init-migration or provide --since. Path: {migration_collection}/{migration_doc}"
            )
            return len(armies), 0, 0

    total = len(armies)
    # 计算过滤条件：优先 Firestore marker，否则 --since，否则不过滤
    if fs_marker:
        marker_iso = fs_marker.get('lastUpdatedTime')
        marker_id = int(fs_marker.get('lastId') or -1)
        if marker_iso:
            # 先按时间过滤
            pre = len(armies)
            armies = _filter_armies_since(armies, marker_iso)
            logging.info(f"Filtered by Firestore marker time={marker_iso}, remaining {len(armies)}/{pre}")
            # 对于等于 marker 时间的记录，再按 id 做二次过滤：> lastId 才处理
            filtered: List[Dict[str, Any]] = []
            for a in armies:
                iso = a.get('updatedTime') or a.get('createdTime')
                if iso == marker_iso:
                    aid = int(a.get('id', -1))
                    if aid > marker_id:
                        filtered.append(a)
                else:
                    filtered.append(a)
            logging.info(
                f"Applied Firestore marker id>{marker_id} on same timestamp, remaining {len(filtered)}/{len(armies)}"
            )
            armies = filtered
        else:
            logging.warning("Firestore marker has no lastUpdatedTime. No time filter applied; consider setting --init-migration.")
    elif since:
        armies = _filter_armies_since(armies, since)
        logging.info(f"Filtered by since={since}, remaining {len(armies)}/{total}")
    else:
        logging.info(f"No since filter provided. Processing all {total} armies.")
    uploaded = 0
    failed = 0
    logging.info(f"Fetched {total} armies")
    if dry_run:
        # 仅打印示例
        logging.info("Dry-run mode: transforming first 3 armies for preview...")
        preview = [transform_army(a) for a in armies[:3]]
        logging.info("Preview doc IDs: %s", ", ".join(str(x.get("id")) for x in preview))
        print(json.dumps(preview, ensure_ascii=False, indent=2))
        return total, 0, 0

    batch = db.batch()
    in_batch = 0
    for idx, army in enumerate(armies, start=1):
        try:
            doc = transform_army(army)
            doc_id = str(doc.get("id"))
            ref = db.collection(collection).document(doc_id)
            if skip_not_newer:
                try:
                    existing = ref.get()
                    if existing.exists:
                        exist_updated = existing.to_dict().get("updatedTime")
                        new_updated = doc.get("updatedTime")
                        if exist_updated and new_updated:
                            exist_ts = _parse_dt(exist_updated) or 0
                            new_ts = _parse_dt(new_updated) or 0
                            if exist_ts >= new_ts:
                                logging.debug(f"Skip not newer id={doc_id} exist={exist_updated} new={new_updated}")
                                continue
                except Exception as e:
                    logging.debug(f"Check skip_not_newer failed for id={doc_id}: {e}")
            batch.set(ref, doc, merge=True)
            uploaded += 1
            in_batch += 1
        except Exception as e:
            failed += 1
            logging.error(f"Failed to enqueue army id={army.get('id')}: {e}")
            logging.debug(traceback.format_exc())

        if in_batch >= batch_size:
            try:
                batch.commit()
                logging.info(f"Committed a batch of {in_batch} documents (progress: {idx}/{total})")
            except Exception as e:
                logging.error(f"Batch commit failed after {idx} processed: {e}")
                logging.debug(traceback.format_exc())
                raise
            finally:
                batch = db.batch()
                in_batch = 0
                time.sleep(0.1)

    if in_batch:
        try:
            batch.commit()
            logging.info(f"Committed final batch of {in_batch} documents (uploaded: {uploaded}/{total}, failed: {failed})")
        except Exception as e:
            logging.error(f"Final batch commit failed: {e}")
            logging.debug(traceback.format_exc())
            raise

    # 保存新的 watermark（取本次处理集合的最大时间）
    watermark = _max_updated_iso(armies)
    if watermark:
        _save_state_since(state_file, watermark)
        if fs_migration:
            try:
                # 更新 Firestore marker：使用本次处理集合的最大时间和该时间下的最大 id
                max_iso = watermark
                max_id = -1
                for a in armies:
                    iso = a.get('updatedTime') or a.get('createdTime')
                    if iso == max_iso:
                        aid = int(a.get('id', -1))
                        if aid > max_id:
                            max_id = aid
                marker_update = {
                    'lastUpdatedTime': max_iso,
                    'lastId': max_id,
                    'lastRunAt': datetime.now(timezone.utc).isoformat(),
                    'uploaded': uploaded,
                    'failed': failed,
                }
                marker_ref = db.collection(migration_collection).document(migration_doc)
                marker_ref.set(marker_update, merge=True)
                logging.info(f"Updated Firestore migration marker: {marker_update}")
            except Exception as e:
                logging.error(f"Failed to update Firestore migration marker: {e}")
                logging.debug(traceback.format_exc())
    return total, uploaded, failed


def main(argv: List[str]) -> int:
    parser = argparse.ArgumentParser(description="Sync Clash armies to Firestore from web export API")
    parser.add_argument("--base-url", default="http://localhost:5173", help="Web 项目可访问的根地址，如 http://localhost:5173")
    parser.add_argument("--service-account", default="layouts-coc-firebase-adminsdk-fbsvc-df1502a772.json", help="Firebase 服务账号 JSON 路径")
    parser.add_argument("--collection", default="armies", help="Firestore 集合名")
    parser.add_argument("--dry-run", action="store_true", help="仅打印转换后的前几条数据，不写入 Firestore")
    parser.add_argument("--since", default=None, help="仅同步 updatedTime >= since 的军队（ISO时间，例如 2024-07-01T00:00:00Z）")
    parser.add_argument("--state-file", default=".sync_state.txt", help="增量同步水位线文件（保存上次同步的最新时间）")
    parser.add_argument("--skip-not-newer", action="store_true", help="写入前检查 Firestore 的 updatedTime，若不比现有新则跳过该文档")
    parser.add_argument("--fs-migration", action="store_true", default=True, help="使用 Firestore 迁移标记控制增量（默认开启）")
    parser.add_argument("--migration-collection", default="migration", help="Firestore 迁移集合名")
    parser.add_argument("--migration-doc", default="cocarmies", help="Firestore 迁移文档ID")
    parser.add_argument("--init-migration", action="store_true", help="仅初始化迁移标记（按当前导出最大时间与ID），不执行上传")
    parser.add_argument("--log-level", default="INFO", choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"], help="日志级别")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=getattr(logging, args.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s: %(message)s",
        datefmt="%H:%M:%S",
    )

    try:
        total, uploaded, failed = upload_armies(
            base_url=args.base_url,
            service_account=args.service_account,
            collection=args.collection,
            dry_run=args.dry_run,
            since=args.since,
            state_file=args.state_file,
            skip_not_newer=args.skip_not_newer,
            fs_migration=args.fs_migration,
            migration_collection=args.migration_collection,
            migration_doc=args.migration_doc,
            init_migration=args.init_migration,
        )
        if args.dry_run:
            logging.info(f"Dry run complete. Total armies available: {total}")
        else:
            logging.info(f"Uploaded {uploaded}/{total} armies to collection '{args.collection}'. Failed: {failed}. ✅")
        return 0
    except Exception as e:
        logging.error(f"Error: {e}")
        logging.debug(traceback.format_exc())
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

