import { useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { contractUtils } from '@/utils/web3Utils'

export default function useWalletActions() {

  const { address: userAddress } = useAccount()
  const { data: signer } = useWalletClient()

  useEffect(() => {
    const address = signer?.account?.address
    if (address && signer && userAddress === address) {
      contractUtils.addSigner(signer)
    } else if (!signer && !address && userAddress) {
      contractUtils.addSigner(null)
    }
  }, [signer, userAddress])
}
