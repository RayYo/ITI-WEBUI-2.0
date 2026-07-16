/** ACL Access Profile 共用逻辑:Summary 拼接 / 详情行 / 按 type+id 取 profile */
import { cgiGet } from '@/api/cgi'

/** 由 profile 配置拼 Profile Summary(如 "Src MAC, Dst MAC, 802.1p, VLAN, EthType") */
export function aclProfileSummary(p) {
  const parts = []
  if (p.srcMask) parts.push('Src MAC')
  if (p.dstMask) parts.push('Dst MAC')
  if (p.p8021) parts.push('802.1p')
  if (p.vlan) parts.push('VLAN')
  if (p.etherType) parts.push('EthType')
  return parts.join(', ')
}

/** Access Profile Details 展示行(L2):[label, value] */
export function aclProfileDetailRows(p) {
  const yn = v => (v ? 'YES' : 'NO')
  return [
    ['Profile ID', p.id],
    ['Source MAC Mask', p.srcMask || '-'],
    ['Destination MAC Mask', p.dstMask || '-'],
    ['802.1p', yn(p.p8021)],
    ['VLAN', yn(p.vlan)],
    ['Ether Type', yn(p.etherType)]
  ]
}

/** 拉全量 profile 列表并按 type/id 取单个 profile(mock 约定:带参 GET 客户端过滤) */
export function loadAclProfile(type, id) {
  return cgiGet('sec_aclProfileList').then(d => {
    const list = (type === 'L3' ? d.l3 : d.l2) || []
    const profile = list.find(e => String(e.id) === String(id)) || null
    return { profile, vlans: d.vlans || [1] }
  })
}
