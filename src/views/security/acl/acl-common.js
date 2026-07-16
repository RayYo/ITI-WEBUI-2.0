/** ACL Access Profile 共用逻辑:Summary 拼接 / 详情行 / 掩码生成 / 按 type+id 取 profile */
import { cgiGet } from '@/api/cgi'

/** IPv4 前缀 → 点分掩码(1→128.0.0.0) */
export function ipv4Mask(prefix) {
  const bits = '1'.repeat(prefix).padEnd(32, '0')
  return [0, 8, 16, 24].map(i => parseInt(bits.slice(i, i + 8), 2)).join('.')
}

/** IPv6 前缀 → 压缩掩码串(1→8000::,2→c000::) */
export function ipv6Mask(prefix) {
  const groups = []
  let bits = prefix
  for (let i = 0; i < 8; i++) {
    const g = Math.min(16, Math.max(0, bits))
    bits -= g
    groups.push(g === 0 ? 0 : (0xFFFF << (16 - g)) & 0xFFFF)
  }
  let last = -1
  groups.forEach((g, i) => { if (g !== 0) last = i })
  if (last === -1) return '::'
  const head = groups.slice(0, last + 1).map(g => g.toString(16)).join(':')
  return last === 7 ? head : head + '::'
}

/** 由 profile 配置拼 Profile Summary(L2 / L3 IPv4 / L3 IPv6) */
export function aclProfileSummary(p) {
  const parts = []
  if (p.ipType) {
    if (p.srcMask) parts.push('Src Ip')
    if (p.dstMask) parts.push('Dst Ip')
    if (p.dscp) parts.push('Dscp')
    if (p.tos) parts.push('ToS')
    if (p.trafficClass) parts.push('Traffic Class')
    if (p.icmpType) parts.push('ICMP Type')
    if (p.icmpCode) parts.push('ICMP Code')
    if (p.igmpType) parts.push('IGMP Type')
    if (p.tcpFlag) parts.push('TCP Flag')
    if (p.srcPort) parts.push('Src Port')
    if (p.dstPort) parts.push('Dst Port')
  } else {
    if (p.srcMask) parts.push('Src MAC')
    if (p.dstMask) parts.push('Dst MAC')
    if (p.p8021) parts.push('802.1p')
    if (p.vlan) parts.push('VLAN')
    if (p.etherType) parts.push('EthType')
  }
  return parts.join(', ')
}

/** Access Profile Details 展示行:[label, value],按截图顺序、仅列已配置项 */
export function aclProfileDetailRows(p) {
  const yn = v => (v ? 'YES' : 'NO')
  if (!p.ipType) {
    return [
      ['Profile ID', p.id],
      ['Source MAC Mask', p.srcMask || '-'],
      ['Destination MAC Mask', p.dstMask || '-'],
      ['802.1p', yn(p.p8021)],
      ['VLAN', yn(p.vlan)],
      ['Ether Type', yn(p.etherType)]
    ]
  }
  const rows = [['Profile ID', p.id]]
  if (p.protocol) {
    rows.push(['IP Protocol', p.protocolName || p.protocol])
    rows.push(['IP Protocol Mask', 'ff'])
  }
  if (p.ipType === 'IPv4') {
    if (p.srcMask) rows.push(['Source IP', p.srcMask])
    if (p.dstMask) rows.push(['Destination IP', p.dstMask])
    if (p.srcPort) rows.push(['Source Port', 'ffff'])
    if (p.dstPort) rows.push(['Destination Port', 'ffff'])
    if (p.dscp) rows.push(['DSCP', 'YES'])
    if (p.tos) rows.push(['ToS', 'YES'])
    if (p.icmpType) rows.push(['ICMP Type', 'YES'])
    if (p.icmpCode) rows.push(['ICMP Code', 'YES'])
    if (p.igmpType) rows.push(['IGMP Type', 'YES'])
    if (p.tcpFlag) rows.push(['TCP Flag Mask', 'YES'])
  } else {
    if (p.srcPort) rows.push(['Source Port', 'ffff'])
    if (p.dstPort) rows.push(['Destination Port', 'ffff'])
    if (p.trafficClass) rows.push(['IPv6 Class', 'YES'])
    if (p.icmpType) rows.push(['ICMP Type', 'YES'])
    if (p.icmpCode) rows.push(['ICMP Code', 'YES'])
    if (p.tcpFlag) rows.push(['TCP Flag Mask', 'YES'])
    if (p.srcMask) rows.push(['Source IPv6', p.srcMask])
    if (p.dstMask) rows.push(['Destination IPv6', p.dstMask])
  }
  return rows
}

/** 拉全量 profile 列表并按 type/id 取单个 profile(mock 约定:带参 GET 客户端过滤) */
export function loadAclProfile(type, id) {
  return cgiGet('sec_aclProfileList').then(d => {
    const list = (type === 'L3' ? d.l3 : d.l2) || []
    const profile = list.find(e => String(e.id) === String(id)) || null
    return { profile, vlans: d.vlans || [1] }
  })
}
