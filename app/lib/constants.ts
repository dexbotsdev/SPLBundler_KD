'user server'

import {config} from 'dotenv'

config()

const tokenFee=process.env.TOKENFEE
const marketFee=process.env.MARKETFEE
const pbFee=process.env.PRIVATEBUNDLEFEE
const dbFee=process.env.DELAYEDBUNDLEFEE

const feeWallet = process.env.FEE_WALLET

export {feeWallet,tokenFee,marketFee,pbFee,dbFee}