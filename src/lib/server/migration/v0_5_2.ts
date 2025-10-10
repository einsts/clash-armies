import type { MigrationFn } from '@ninjalib/sql';

// prettier-ignore
export default function migration(runStep: MigrationFn) {
    runStep(54, `
        ALTER TABLE users
        ADD COLUMN appleId VARCHAR(255) NULL,
        ADD COLUMN appleEmail VARCHAR(255) NULL
    `);
    runStep(55, `
        ALTER TABLE users
        MODIFY COLUMN googleId VARCHAR(255) NULL
    `);
}


