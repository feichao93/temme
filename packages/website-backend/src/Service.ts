import { Collection, Db } from 'mongodb'
import { UserInfo } from './interfaces'

type UsersCollectionSchema = { id: number; access_token: string; userInfo: UserInfo }

export default class Service {
  users: Collection<UsersCollectionSchema>

  constructor(readonly db: Db) {
    this.users = this.db.collection('users')
  }

  updateUserProfile(id: number, access_token: string, userInfo: UserInfo) {
    return this.users.updateOne({ id }, { $set: { id, access_token, userInfo } }, { upsert: true })
  }
}
