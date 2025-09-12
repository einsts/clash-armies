import type { MySQL, MigrationFn } from '@ninjalib/sql';
import type { Unit, Pet } from '$types';

// prettier-ignore
export default function migration(runStep: MigrationFn) {
   
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
	
}
