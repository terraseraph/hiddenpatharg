/*
  Warnings:

  - You are about to drop the `Player` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `players` to the `Team` table without a default value. This is not possible if the table is not empty.

*/

PRAGMA foreign_keys=OFF;

-- Convert existing players to JSON and update Team table
CREATE TABLE "new_Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "players" TEXT NOT NULL DEFAULT '[]'
);

-- Copy existing teams and convert their players to JSON
INSERT INTO "new_Team" ("id", "name", "players")
SELECT 
    t.id,
    t.name,
    COALESCE(
        (
            SELECT json_group_array(
                json_object(
                    'id', p.id,
                    'name', p.name,
                    'email', p.email,
                    'phone', p.phone,
                    'isTeamLeader', p.isTeamLeader,
                    'details', p.details
                )
            )
            FROM "Player" p
            WHERE p.teamId = t.id
        ),
        '[]'
    ) as players
FROM "Team" t;

-- Drop old tables
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";

-- Drop Player table and its indices
DROP INDEX IF EXISTS "Player_email_key";
DROP TABLE IF EXISTS "Player";

PRAGMA foreign_keys=ON;
