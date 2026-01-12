# AUDIT_CONTEXT

Generated: `2026-01-12T07:29:19+02:00`

## Commands

`pwd`
/home/mcorpofficial/projektai/julios projekt/reflectus-app

`git status --porcelain=v1 -b`
## main
 M .gitignore
 M README.md
 M next.config.ts
 M package-lock.json
 M package.json
 D postcss.config.mjs
 M src/app/globals.css
 M src/app/layout.tsx
 M src/app/page.tsx
?? .github/
?? Dockerfile
?? docker-compose.prod.yml
?? docker-compose.yml
?? docs/
?? env.example
?? logs/
?? postcss.config.js
?? prisma.config.ts
?? prisma/
?? scripts/
?? setup-postgres.sh
?? src/app/admin/
?? src/app/api/
?? src/app/builder/
?? src/app/dashboard/
?? src/app/facilitator/
?? src/app/participant/
?? src/components/
?? src/lib/
?? tailwind.config.ts
?? tests/
?? tsconfig-paths-setup.js
?? tsconfig-paths-setup.ts
?? types/

`git rev-parse --abbrev-ref HEAD`
main

`git log -n 10 --oneline --decorate`
3345a36 (HEAD -> main) Initial commit from Create Next App

`git remote -v`

`node -v`
v20.19.6

`npm -v`
10.8.2

`docker --version`
Docker version 29.1.3, build f52814d

`docker compose version`
Docker Compose version v5.0.1

`npx prisma -v`
prisma               : 7.2.0
@prisma/client       : 7.2.0
Operating System     : linux
Architecture         : x64
Node.js              : v20.19.6
TypeScript           : 5.9.3
Query Compiler       : enabled
PSL                  : @prisma/prisma-schema-wasm 7.2.0-4.0c8ef2ce45c83248ab3df073180d5eda9e8be7a3
Schema Engine        : schema-engine-cli 0c8ef2ce45c83248ab3df073180d5eda9e8be7a3 (at node_modules/@prisma/engines/schema-engine-debian-openssl-3.0.x)
Default Engines Hash : 0c8ef2ce45c83248ab3df073180d5eda9e8be7a3
Studio               : 0.9.0

`ss -ltnp | rg :5432` (port check)
