prisma.schema

```ts
model Organization {
  id          String @id @default(uuid())
  name        String
  description String
  customURL   String @unique
  createdAt DateTime @default(now())
  updatedAt DateTime
  // - update log // create a folder and store there?


  // admin   User   @relation("admin", fields: [adminId], references: [id])
  // to ensure you only have one owned organization
  // adminId String @unique

  // moderator   User      @relation("moderator", fields: [moderatorId], references: [id])
  // moderatorId String[]

  // 	- time
  // 	- action
  // 	- by whom
  Profile Profile[] // member profiles
  User    User[] // members
  Post    Post[] // posts owned by organization
}
```
