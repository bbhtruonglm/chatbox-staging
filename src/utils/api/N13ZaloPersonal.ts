import { Botx } from '@/utils/api/Botx'
import { injectable } from 'tsyringe'

@injectable()
export class N13ZaloPersonal extends Botx {
  constructor(path: string) {
    super(`${$env.host.n13_zalo_personal}/${path}`)
  }

  public async createGroupZalo(payload: {
    page_id: string
    group_name: string
    member_ids: string[]
  }): Promise<string> {
    return this.post('create_group', payload)
  }
}
