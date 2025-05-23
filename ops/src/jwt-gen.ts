import { create } from "auth"

console.log("Admin token:")
console.log(create({ version: 1, role: "admin" }))

console.log()

console.log("User token")
console.log(create({ version: 1, role: "user" }))
