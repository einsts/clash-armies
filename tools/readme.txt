一.首次上传（Firestore 当前为空）
 你有两种选择：
 1.需要把“现有所有军队”一次性回填到 Firestore（推荐）
   直接做一次“全量上传”，通过 --since 给一个很早的时间，绕过首轮的迁移标记检查；上传完成后会自动写入 migration/cocarmies 标记，后续即可增量。
   命令示例：
     python firestore_upload.py --since 1970-01-01T00:00:00Z --log-level INFO
 2.不想回填历史，只从“现在起”的新增开始同步
   先初始化迁移标记（不上传），把基准线定在当前导出数据的“最大时间点+该时间下的最大ID”：
     python firestore_upload.py --init-migration --log-level INFO
   之后按“后续增量上传”的方式运行（见下）。

二.后续有新增数据时（增量上传）
  正常跑即可（基于 Firestore migration/cocarmies 标记自动增量）：
    python firebase_upload.py  --log-level INFO
  可选安全项：避免覆盖较新的目标数据
    python firestore_upload.py --skip-not-newer --log-level INFO

三.说明：
  若首次上传时 Firestore 中没有 migration/cocarmies 标记，且你没有传 --since，脚本会拒绝上传（防误操作）。因此首次“回填”请选择“全量上传带 --since”，首次“只从现在起”请选择“--init-migration”。
  运行成功后，脚本会自动更新 migration/cocarmies 文档里的 lastUpdatedTime、lastId、lastRunAt，供下次增量使用。
  生产环境请将 --base-url 换成线上域名；加 --log-level DEBUG 可看更详细日志。
  首次回填：用 --since 做一次全量；或用 --init-migration 不回填只立基线。
  后续增量：直接运行（可加 --skip-not-newer），脚本基于 Firestore 标记自动增量。
