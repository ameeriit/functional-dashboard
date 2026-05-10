import type { User } from "../model/types"
import { mockUsers } from "./mock-users"

export async function getUsers(): Promise<User[]> {
  return mockUsers
}
