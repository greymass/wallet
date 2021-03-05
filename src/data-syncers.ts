import {Asset, UInt64, LinkSession} from 'anchor-link'
import {wait} from '~/helpers'
import type {ChainConfig} from '~/config'
import {fetchActiveBlockchain, fetchActiveSession, txFees} from '~/store'

export async function syncTxFee() {
    while (true) {
        await fetchFee().catch((error) => {
            console.log('An error occured while fetching tx fee amount', {error})
        })

        await wait(15000)
    }
}

export function syncAll() {
    syncTxFee()
}

export async function fetchFee() {
    const session: LinkSession = await fetchActiveSession()
    const blockchain: ChainConfig = await fetchActiveBlockchain()

    if (!blockchain.hasFees) {
        return
    }

    const fees = await session.client.v1.chain.get_table_rows({
        code: `${blockchain.id}.fee`,
        table: `${blockchain.id}fees`,
        scope: `${blockchain.id}.fee`,
        key_type: 'i64',
        index_position: 'primary',
        lower_bound: UInt64.from(5),
        upper_bound: UInt64.from(5),
        limit: 1,
    })

    const fee = Asset.fromUnits(fees.rows[0].suf_amount, blockchain.coreTokenSymbol)

    txFees.set(blockchain.id, fee)
}
