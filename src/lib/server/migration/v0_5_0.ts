import type { MySQL, MigrationFn } from '@ninjalib/sql';
import type { Unit, Pet } from '$types';

// prettier-ignore
//这里的53-55是我增加的，56对应原作者的53，这里可以考虑下次将数据库中的版本号改为53，然后把53-56合并为一条53
export default function migration(runStep: MigrationFn) {
    runStep(47, `
        ALTER TABLE users
        ADD COLUMN createdTime TIMESTAMP DEFAULT NOW()
    `);
    runStep(48, `
        CREATE TABLE army_tags (
            armyId INT NOT NULL,
            tag VARCHAR(50) NOT NULL,
            PRIMARY KEY (armyId, tag),
            CONSTRAINT fk_army_tags_army_id FOREIGN KEY (armyId) REFERENCES armies (id) ON DELETE CASCADE
        )
    `);
    runStep(49, async (db: MySQL) => {
		// Insert data for new "Dark Crown" equipment
		const equipmentId = await db.insertOne('equipment', {
			hero: 'Minion Prince',
			name: 'Dark Crown',
			epic: 1,
            clashId: 35,
		});
		// Insert levels
		await db.insertMany('equipment_levels', [
			{ equipmentId, level: 1, blacksmithLevel: 1 },
			{ equipmentId, level: 2, blacksmithLevel: 1 },
			{ equipmentId, level: 3, blacksmithLevel: 1 },
			{ equipmentId, level: 4, blacksmithLevel: 1 },
			{ equipmentId, level: 5, blacksmithLevel: 1 },
			{ equipmentId, level: 6, blacksmithLevel: 1 },
			{ equipmentId, level: 7, blacksmithLevel: 1 },
			{ equipmentId, level: 8, blacksmithLevel: 1 },
			{ equipmentId, level: 9, blacksmithLevel: 1 },
			{ equipmentId, level: 10, blacksmithLevel: 1 },
			{ equipmentId, level: 11, blacksmithLevel: 1 },
			{ equipmentId, level: 12, blacksmithLevel: 1 },
			{ equipmentId, level: 13, blacksmithLevel: 3 },
			{ equipmentId, level: 14, blacksmithLevel: 3 },
			{ equipmentId, level: 15, blacksmithLevel: 3 },
			{ equipmentId, level: 16, blacksmithLevel: 5 },
			{ equipmentId, level: 17, blacksmithLevel: 5 },
			{ equipmentId, level: 18, blacksmithLevel: 5 },
			{ equipmentId, level: 19, blacksmithLevel: 7 },
			{ equipmentId, level: 20, blacksmithLevel: 7 },
			{ equipmentId, level: 21, blacksmithLevel: 7 },
			{ equipmentId, level: 22, blacksmithLevel: 8 },
			{ equipmentId, level: 23, blacksmithLevel: 8 },
			{ equipmentId, level: 24, blacksmithLevel: 8 },
			{ equipmentId, level: 25, blacksmithLevel: 9 },
			{ equipmentId, level: 26, blacksmithLevel: 9 },
			{ equipmentId, level: 27, blacksmithLevel: 9 },
		]);
	});
	runStep(50, `
        UPDATE town_halls SET
            maxDarkSpellFactory = 7
        WHERE level >= 14
    `);
	runStep(51, async (db: MySQL) => {
		// Insert data for new "Ice Block" spell
        const spellId = await db.insertOne('units', {
            type: 'Spell',
            name: 'Ice Block',
            clashId: 109,
            housingSpace: 1,
            productionBuilding: 'Dark Spell Factory',
        });
        await db.insertMany('unit_levels', [
            { unitId: spellId, level: 1, spellFactoryLevel: 7, laboratoryLevel: 1 },
            { unitId: spellId, level: 2, spellFactoryLevel: 7, laboratoryLevel: 12 },
            { unitId: spellId, level: 3, spellFactoryLevel: 7, laboratoryLevel: 13 },
            { unitId: spellId, level: 4, spellFactoryLevel: 7, laboratoryLevel: 14 },
            { unitId: spellId, level: 4, spellFactoryLevel: 7, laboratoryLevel: 15 },
        ]);

		// Insert data for new "Balloon" level
		const balloon = await db.getRow<Unit>('units', { name: 'Balloon' });
		const superBalloon = await db.getRow<Unit>('units', { name: 'Rocket Balloon' });
		await db.insertOne('unit_levels', { unitId: balloon.id, level: 12, barrackLevel: 6, laboratoryLevel: 15 });
		await db.insertOne('unit_levels', { unitId: superBalloon.id, level: 12, barrackLevel: 6, laboratoryLevel: 1 });

		// Insert data for new "Druid" level
		const druid = await db.getRow<Unit>('units', { name: 'Druid' });
		await db.insertOne('unit_levels', { unitId: druid.id, level: 5, barrackLevel: 11, laboratoryLevel: 15 });

		// Insert data for new "Battle Blimp" level
		const blimp = await db.getRow<Unit>('units', { name: 'Battle Blimp' });
		await db.insertOne('unit_levels', { unitId: blimp.id, level: 5, barrackLevel: 2, laboratoryLevel: 13 });

		// Insert data for new "Frosty" levels
		const frosty = await db.getRow<Pet>('pets', { name: 'Frosty' });
		await db.insertMany('pet_levels', [
            { petId: frosty.id, level: 11, petHouseLevel: 11 },
            { petId: frosty.id, level: 12, petHouseLevel: 11 },
            { petId: frosty.id, level: 13, petHouseLevel: 11 },
            { petId: frosty.id, level: 14, petHouseLevel: 11 },
            { petId: frosty.id, level: 15, petHouseLevel: 11 },
        ]);
	});
	// Insert vote metric so we can store it's weight and update it on-demand if required
	// NOTE: minAgeHours doesn't have any effect since votes are recorded externally of army_metric_events
	runStep(52, `
		INSERT INTO metrics (name, weight, minAgeHours) VALUES
			('vote', 50, 1)
	`);
	

	runStep(53, `
		CREATE TABLE  user_refresh_tokens (
			userId INT NOT NULL,
			tokenVersion INT NOT NULL DEFAULT 0,
			lastJti VARCHAR(128) NULL,
			createdAt TIMESTAMP DEFAULT NOW(),
            updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
			PRIMARY KEY (userId),
			CONSTRAINT fk_user_refresh_tokens_users FOREIGN KEY (userId) REFERENCES users(id)
			ON DELETE CASCADE
			ON UPDATE CASCADE
		);
	`);

	runStep(54, `
        ALTER TABLE users
        ADD COLUMN appleId VARCHAR(255) NULL,
        ADD COLUMN appleEmail VARCHAR(255) NULL
    `);
    runStep(55, `
        ALTER TABLE users
        MODIFY COLUMN googleId VARCHAR(255) NULL
    `);

	runStep(56, async (db: MySQL) => {
		// Insert data for new "Heroic Torch" equipment
		const equipmentId = await db.insertOne('equipment', {
			hero: 'Grand Warden',
			name: 'Heroic Torch',
			epic: 1,
            clashId: 19,
		});
		// Insert levels
		await db.insertMany('equipment_levels', [
			{ equipmentId, level: 1, blacksmithLevel: 1 },
			{ equipmentId, level: 2, blacksmithLevel: 1 },
			{ equipmentId, level: 3, blacksmithLevel: 1 },
			{ equipmentId, level: 4, blacksmithLevel: 1 },
			{ equipmentId, level: 5, blacksmithLevel: 1 },
			{ equipmentId, level: 6, blacksmithLevel: 1 },
			{ equipmentId, level: 7, blacksmithLevel: 1 },
			{ equipmentId, level: 8, blacksmithLevel: 1 },
			{ equipmentId, level: 9, blacksmithLevel: 1 },
			{ equipmentId, level: 10, blacksmithLevel: 1 },
			{ equipmentId, level: 11, blacksmithLevel: 1 },
			{ equipmentId, level: 12, blacksmithLevel: 1 },
			{ equipmentId, level: 13, blacksmithLevel: 3 },
			{ equipmentId, level: 14, blacksmithLevel: 3 },
			{ equipmentId, level: 15, blacksmithLevel: 3 },
			{ equipmentId, level: 16, blacksmithLevel: 5 },
			{ equipmentId, level: 17, blacksmithLevel: 5 },
			{ equipmentId, level: 18, blacksmithLevel: 5 },
			{ equipmentId, level: 19, blacksmithLevel: 7 },
			{ equipmentId, level: 20, blacksmithLevel: 7 },
			{ equipmentId, level: 21, blacksmithLevel: 7 },
			{ equipmentId, level: 22, blacksmithLevel: 8 },
			{ equipmentId, level: 23, blacksmithLevel: 8 },
			{ equipmentId, level: 24, blacksmithLevel: 8 },
			{ equipmentId, level: 25, blacksmithLevel: 9 },
			{ equipmentId, level: 26, blacksmithLevel: 9 },
			{ equipmentId, level: 27, blacksmithLevel: 9 },
		]);

		// Insert data for new "Lava Hound" level
		const lavaHound = await db.getRow<Unit>('units', { name: 'Lava Hound' });
		const iceHound = await db.getRow<Unit>('units', { name: 'Ice Hound' });
		await db.insertOne('unit_levels', { unitId: lavaHound.id, level: 7, barrackLevel: 6, laboratoryLevel: 14 });
		await db.insertOne('unit_levels', { unitId: iceHound.id, level: 7, barrackLevel: 6, laboratoryLevel: 1 });

		// Insert data for new "Ice Block" level
		const iceBlock = await db.getRow<Unit>('units', { name: 'Ice Block' });
        await db.insertOne('unit_levels', { unitId: iceBlock.id, level: 5, spellFactoryLevel: 7, laboratoryLevel: 15 });
	});
}
