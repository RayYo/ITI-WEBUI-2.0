import Vue from 'vue'
import Router from 'vue-router'

// Fixed an error when VUe-Router repeatedly clicks the menu in ElementUI navigation bar above version 3.0
const includPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return includPush.call(this, location).catch(err => err)
}
Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import WizardLayout from '@/wizard/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  },

  /** **************** Wizard ******************/
  {
    path: '/wizard',
    component: WizardLayout,
    name: 'Wizard',
    hidden: true,
    redirect: '/wizard/setup',
    children: [
      {
        path: 'setup',
        name: 'Setup',
        component: () => import('@/wizard/components/Setup')
      },
      {
        path: 'step1',
        name: 'Step1',
        component: () => import('@/wizard/components/Step1')
      },
      {
        path: 'step2',
        name: 'Step2',
        component: () => import('@/wizard/components/Step2')
      },
      {
        path: 'step3',
        name: 'Step3',
        component: () => import('@/wizard/components/Step3')
      },
      {
        path: 'step4',
        name: 'Step4',
        component: () => import('@/wizard/components/Step4')
      }
    ]
  },
  /** **************** System ******************/
  {
    path: '/system',
    component: Layout,
    name: 'System',
    meta: { title: 'System', icon: 'system' },
    redirect: '/system/management',
    children: [
      {
        path: 'management',
        name: 'Management',
        component: () => import('@/views/system/management'),
        meta: { title: 'System Management', icon: 'submenu' }
      },
      {
        path: 'cloud',
        name: 'Cloud',
        component: () => import('@/views/system/cloud-setting'),
        meta: { title: 'Cloud Setting', icon: 'submenu' }
      },
      {
        path: 'l3-feature',
        name: 'L3-Feature',
        component: () => import('@/views/system/l3-feature'),
        meta: { title: 'L3-Feature', icon: 'submenu' },
        redirect: '/system/l3-feature/ipv4-interface',
        children: [
          {
            path: 'ipv4-interface',
            name: 'IPv4-Interface',
            component: () => import('@/views/system/l3-feature/ipv4-interface'),
            meta: { title: 'IPv4 Interface', icon: 'submenu' }
          },
          {
            path: 'ipv4-arp-aging-time',
            name: 'IPv4-ARP-Aging-Time',
            component: () => import('@/views/system/l3-feature/ipv4-arp-aging-time'),
            meta: { title: 'IPv4 ARP Aging Time', icon: 'submenu' }
          },
          {
            path: 'ipv4-arp-table',
            name: 'IPv4-ARP-Table',
            component: () => import('@/views/system/l3-feature/ipv4-arp-table'),
            meta: { title: 'IPv4 ARP Table', icon: 'submenu' }
          },
          {
            path: 'ipv4-static-default-route',
            name: 'IPv4-Static-Default-Route',
            component: () => import('@/views/system/l3-feature/ipv4-static-default-route'),
            meta: { title: 'IPv4 Static/Default Route', icon: 'submenu' }
          },
          {
            path: 'ipv4-intf-edit',
            name: 'IPv4-Intf-Edit',
            hidden: true,
            component: () => import('@/views/system/l3-feature/ipv4-intf-edit')
          },
          {
            path: 'ipv6-interface',
            name: 'IPv6-Interface',
            component: () => import('@/views/system/l3-feature/ipv6-interface'),
            meta: { title: 'IPv6 Interface', icon: 'submenu' }
          },
          {
            path: 'ipv6-intf-detail',
            name: 'IPv6-Intf-Detail',
            hidden: true,
            component: () => import('@/views/system/l3-feature/ipv6-intf-detail')
          },
          {
            path: 'ipv6-neighbor',
            name: 'IPV6-Neighbor',
            component: () => import('@/views/system/l3-feature/ipv6-neighbor'),
            meta: { title: 'IPv6 Neighbor', icon: 'submenu' }
          },
          {
            path: 'ipv6-static-default-route',
            name: 'IPv6-Static-Default-Route',
            component: () => import('@/views/system/l3-feature/ipv6-static-default-route'),
            meta: { title: 'IPv6 Static/Default Route', icon: 'submenu' }
          }
        ]
      },
      {
        path: 'dns',
        name: 'DNS',
        component: () => import('@/views/system/dns'),
        meta: { title: 'DNS', icon: 'submenu' }
      },
      {
        path: 'ip-access-list',
        name: 'IP-Access-List',
        component: () => import('@/views/system/ip-access-list'),
        meta: { title: 'IP Access List', icon: 'submenu' }
      },
      {
        path: 'administration',
        name: 'Administration',
        component: () => import('@/views/system/administration'),
        meta: { title: 'Administration', icon: 'submenu' }
      },
      {
        path: 'user-account-modify',
        name: 'User-Account-Modify',
        hidden: true,
        component: () => import('@/views/system/administration/user-account-modify')
      },
      {
        path: 'timeout',
        name: 'Timeout',
        component: () => import('@/views/system/timeout'),
        meta: { title: 'Timeout', icon: 'submenu' }
      },
      {
        path: 'system-time',
        name: 'System-Time',
        component: () => import('@/views/system/system-time'),
        meta: { title: 'System Time', icon: 'submenu' }
      },
      {
        path: 'ssl',
        name: 'SSL',
        component: () => import('@/views/system/ssl'),
        meta: { title: 'SSL', icon: 'submenu' }
      },
      {
        path: 'ssh',
        name: 'SSH',
        component: () => import('@/views/system/ssh'),
        meta: { title: 'SSH', icon: 'submenu' }
      },
      {
        path: 'telnet',
        name: 'Telnet',
        component: () => import('@/views/system/telnet'),
        meta: { title: 'Telnet', icon: 'submenu' }
      },
      {
        path: 'dhcp-auto-config',
        name: 'DHCP-Auto_Config',
        component: () => import('@/views/system/dhcp-auto-config'),
        meta: { title: 'DHCP Auto Configuration', icon: 'submenu' }
      },
      {
        path: 'system-log',
        name: 'System-Log',
        component: () => import('@/views/system/system-log'),
        meta: { title: 'System Log', icon: 'submenu' }
      },
      {
        path: 'snmp',
        name: 'SNMP',
        component: () => import('@/components/RouterView'),
        meta: { title: 'SNMP', icon: 'submenu' },
        redirect: '/system/snmp/settings',
        children: [
          {
            path: 'settings',
            name: 'SNMP-Settings',
            component: () => import('@/views/system/snmp/settings'),
            meta: { title: 'Settings', icon: 'submenu' }
          },
          {
            path: 'view',
            name: 'SNMP-View',
            component: () => import('@/views/system/snmp/view'),
            meta: { title: 'View', icon: 'submenu' }
          },
          {
            path: 'group',
            name: 'SNMP-Group',
            component: () => import('@/views/system/snmp/group'),
            meta: { title: 'Group', icon: 'submenu' }
          },
          {
            path: 'user',
            name: 'SNMP-User',
            component: () => import('@/views/system/snmp/user'),
            meta: { title: 'User', icon: 'submenu' }
          },
          {
            path: 'community',
            name: 'SNMP-Community',
            component: () => import('@/views/system/snmp/community'),
            meta: { title: 'Community', icon: 'submenu' }
          },
          {
            path: 'trap',
            name: 'SNMP-Trap',
            component: () => import('@/views/system/snmp/trap'),
            meta: { title: 'Trap', icon: 'submenu' }
          }
        ]
      },
      {
        path: 'rmon',
        name: 'RMON',
        component: () => import('@/components/RouterView'),
        meta: { title: 'RMON', icon: 'submenu' },
        redirect: '/system/rmon/settings',
        children: [
          {
            path: 'settings',
            name: 'RMON-Settings',
            component: () => import('@/views/system/rmon/settings'),
            meta: { title: 'Settings', icon: 'submenu' }
          },
          {
            path: 'statistics',
            name: 'RMON-Statistics',
            component: () => import('@/views/system/rmon/statistics'),
            meta: { title: 'Statistics', icon: 'submenu' }
          },
          {
            path: 'history',
            name: 'RMON-History',
            component: () => import('@/views/system/rmon/history'),
            meta: { title: 'History', icon: 'submenu' }
          },
          {
            path: 'alarm',
            name: 'RMON-Alarm',
            component: () => import('@/views/system/rmon/alarm'),
            meta: { title: 'Alarm', icon: 'submenu' }
          },
          {
            path: 'event',
            name: 'RMON-Event',
            component: () => import('@/views/system/rmon/event'),
            meta: { title: 'Event', icon: 'submenu' }
          }
        ]
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/components/RouterView'),
        meta: { title: 'Statistics', icon: 'submenu' },
        redirect: '/system/statistics/traffic',
        children: [
          {
            path: 'traffic',
            name: 'Statistics-Traffic',
            component: () => import('@/views/system/statistics/traffic'),
            meta: { title: 'Traffic', icon: 'submenu' }
          },
          {
            path: 'error',
            name: 'Statistics-Error',
            component: () => import('@/views/system/statistics/error'),
            meta: { title: 'Error', icon: 'submenu' }
          }
        ]
      },
      {
        path: 'eee',
        name: 'EEE',
        component: () => import('@/views/system/eee'),
        meta: { title: 'IEEE 802.3az EEE', icon: 'submenu' }
      }
    ]
  },
  /** **************** Network ******************/
  {
    path: '/network',
    component: Layout,
    name: 'Network',
    meta: { title: 'Network', icon: 'network' },
    redirect: '/network/physical-interface',
    children: [
      {
        path: 'physical-interface',
        name: 'Physical-Interface',
        component: () => import('@/views/network/physical-interface'),
        meta: { title: 'Physical Interface', icon: 'submenu' }
      },
      {
        path: 'spanning-tree',
        name: 'Spanning-Tree',
        component: () => import('@/views/network/spanning-tree/index'),
        meta: { title: 'Spanning Tree', icon: 'submenu' },
        redirect: '/network/spanning-tree/protocol',
        children: [
          {
            path: 'protocol',
            name: 'Protocol',
            component: () => import('@/views/network/spanning-tree/protocol'),
            meta: { title: 'Protocol', icon: 'submenu' }
          },
          {
            path: 'port',
            name: 'Port',
            component: () => import('@/views/network/spanning-tree/port'),
            meta: { title: 'Port', icon: 'submenu' }
          },
          {
            path: 'tc-protect',
            name: 'TC-Protect',
            component: () => import('@/views/network/spanning-tree/tc-protect'),
            meta: { title: 'TC Protect Settings', icon: 'submenu' }
          },
          {
            path: 'mst',
            name: 'MST',
            component: () => import('@/views/network/spanning-tree/mst'),
            meta: { title: 'MST', icon: 'submenu' }
          },
          {
            path: 'instance',
            name: 'ST-Instance',
            component: () => import('@/views/network/spanning-tree/instance'),
            meta: { title: 'Instance', icon: 'submenu' }
          },
          {
            path: 'mst-port',
            name: 'MST-Port',
            component: () => import('@/views/network/spanning-tree/mst-port'),
            meta: { title: 'MST Port', icon: 'submenu' }
          }
        ]
      },
      {
        path: 'trunk',
        name: 'Trunk',
        component: () => import('@/views/network/trunk/index'),
        meta: { title: 'Trunk', icon: 'submenu' },
        redirect: '/network/trunk/settings',
        children: [
          {
            path: 'settings',
            name: 'Settings',
            component: () => import('@/views/network/trunk/settings'),
            meta: { title: 'Settings', icon: 'submenu' }
          },
          {
            path: 'status',
            name: 'Status',
            component: () => import('@/views/network/trunk/status'),
            meta: { title: 'Status', icon: 'submenu' }
          },
          {
            path: 'port-priority',
            name: 'Port-Pri',
            component: () => import('@/views/network/trunk/port-priority'),
            meta: { title: 'Port Priority', icon: 'submenu' }
          }
        ]
      },
      {
        path: 'mirroring',
        name: 'Mirroring',
        component: () => import('@/views/network/mirroring'),
        meta: { title: 'Mirroring', icon: 'submenu' }
      },
      {
        path: 'loopback-detection',
        name: 'Loopback-Detection',
        component: () => import('@/views/network/loopback-detection'),
        meta: { title: 'Loopback Detection', icon: 'submenu' }
      },
      {
        path: 'static-unicast',
        name: 'Static-Unicast',
        component: () => import('@/views/network/mac-address/static-unicast'),
        meta: { title: 'Static Unicast', icon: 'submenu' }
      },
      {
        path: 'static-multicast',
        name: 'Static-Multicast',
        component: () => import('@/views/network/mac-address/static-multicast'),
        meta: { title: 'Static Multicast', icon: 'submenu' }
      },
      {
        path: 'igmp-snooping',
        name: 'IGMP-Snooping',
        component: () => import('@/views/network/igmp-snooping/index'),
        meta: { title: 'IGMP Snooping', icon: 'submenu' },
        redirect: '/network/igmp-snooping/settings',
        children: [
          {
            path: 'settings',
            name: 'IGMP-Settings',
            component: () => import('@/views/network/igmp-snooping/settings'),
            meta: { title: 'Settings', icon: 'submenu' }
          },
          {
            path: 'router-port',
            name: 'IGMP-RouterPort',
            component: () => import('@/views/network/igmp-snooping/router-port'),
            meta: { title: 'Router Port', icon: 'submenu' }
          },
          {
            path: 'router-port-modify',
            name: 'IGMP-RouterPort-Modify',
            hidden: true,
            component: () => import('@/views/network/igmp-snooping/router-port-modify')
          }
        ]
      },
      {
        path: 'mld-snooping',
        name: 'MLD-Snooping',
        component: () => import('@/views/network/mld-snooping/index'),
        meta: { title: 'MLD Snooping', icon: 'submenu' },
        redirect: '/network/mld-snooping/settings',
        children: [
          {
            path: 'settings',
            name: 'MLD-Settings',
            component: () => import('@/views/network/mld-snooping/settings'),
            meta: { title: 'Settings', icon: 'submenu' }
          },
          {
            path: 'router-port',
            name: 'MLD-RouterPort',
            component: () => import('@/views/network/mld-snooping/router-port'),
            meta: { title: 'Router Port', icon: 'submenu' }
          },
          {
            path: 'router-port-modify',
            name: 'MLD-RouterPort-Modify',
            hidden: true,
            component: () => import('@/views/network/mld-snooping/router-port-modify')
          }
        ]
      },
      {
        path: 'multicast-vlan',
        name: 'Multicast-VLAN',
        component: () => import('@/views/network/multicast-vlan/index'),
        meta: { title: 'Multicast VLAN', icon: 'submenu' },
        redirect: '/network/multicast-vlan/global-settings',
        children: [
          {
            path: 'global-settings',
            name: 'MCVLAN-Global',
            component: () => import('@/views/network/multicast-vlan/global-settings'),
            meta: { title: 'Global Settings', icon: 'submenu' }
          },
          {
            path: 'vlan-table',
            name: 'MCVLAN-Table',
            component: () => import('@/views/network/multicast-vlan/vlan-table'),
            meta: { title: 'VLAN Table', icon: 'submenu' }
          },
          {
            path: 'group-setup',
            name: 'MCVLAN-Group',
            component: () => import('@/views/network/multicast-vlan/group-setup'),
            meta: { title: 'Group Setup', icon: 'submenu' }
          },
          {
            path: 'associate-group-setup',
            name: 'MCVLAN-Assoc',
            component: () => import('@/views/network/multicast-vlan/associate-group-setup'),
            meta: { title: 'Associate Group Setup', icon: 'submenu' }
          },
          {
            path: 'ports-settings',
            name: 'MCVLAN-PortsSettings',
            hidden: true,
            component: () => import('@/views/network/multicast-vlan/ports-settings')
          }
        ]
      },
      {
        path: 'multicast-filtering',
        name: 'Multicast-Filtering',
        component: () => import('@/views/network/multicast-filtering/index'),
        meta: { title: 'Multicast Filtering', icon: 'submenu' }
      },
      {
        path: 'bandwidth-control',
        name: 'Bandwidth-Control',
        component: () => import('@/views/network/bandwidth-control/index'),
        meta: { title: 'Bandwidth Control', icon: 'submenu' },
        redirect: '/network/bandwidth-control/storm-control',
        children: [
          {
            path: 'storm-control',
            name: 'Storm-Control',
            component: () => import('@/views/network/bandwidth-control/storm-control'),
            meta: { title: 'Storm Control', icon: 'submenu' }
          },
          {
            path: 'ingress-rate-limiting',
            name: 'Ingress-Rate-Limiting',
            component: () => import('@/views/network/bandwidth-control/ingress-rate-limiting'),
            meta: { title: 'Ingress Rate Limiting', icon: 'submenu' }
          },
          {
            path: 'egress-rate-limiting',
            name: 'Egress-Rate-Limiting',
            component: () => import('@/views/network/bandwidth-control/egress-rate-limiting'),
            meta: { title: 'Egress Rate Limiting', icon: 'submenu' }
          }
        ]
      },
      {
        path: 'vlan',
        name: 'VLAN',
        component: () => import('@/views/network/vlan/index'),
        meta: { title: 'VLAN', icon: 'submenu' },
        redirect: '/network/vlan/tagged',
        children: [
          {
            path: 'tagged',
            name: 'VLAN-Tagged',
            component: () => import('@/views/network/vlan/tagged'),
            meta: { title: 'Tagged', icon: 'submenu' }
          },
          {
            path: 'vlan-tagged-modify',
            name: 'VLAN-Tagged-Modify',
            hidden: true,
            component: () => import('@/views/network/vlan/tagged-modify')
          },
          {
            path: 'port',
            name: 'VLAN-Port',
            component: () => import('@/views/network/vlan/port'),
            meta: { title: 'Port', icon: 'submenu' }
          },
          {
            path: 'forwarding',
            name: 'VLAN-Forwarding',
            component: () => import('@/views/network/vlan/forwarding'),
            meta: { title: 'Forwarding', icon: 'submenu' }
          },
          {
            path: 'dynamic',
            name: 'VLAN-Dynamic',
            component: () => import('@/views/network/vlan/dynamic'),
            meta: { title: 'Dynamic', icon: 'submenu' }
          },
          {
            path: 'private',
            name: 'VLAN-Private',
            component: () => import('@/views/network/vlan/private'),
            meta: { title: 'Private', icon: 'submenu' }
          },
          {
            path: 'current',
            name: 'VLAN-Current',
            component: () => import('@/views/network/vlan/current'),
            meta: { title: 'Current', icon: 'submenu' }
          }
        ]
      },
      {
        path: 'gvrp',
        name: 'GVRP',
        component: () => import('@/views/network/gvrp/index'),
        meta: { title: 'GVRP', icon: 'submenu' },
        redirect: '/network/gvrp/global-settings',
        children: [
          {
            path: 'global-settings',
            name: 'GVRP-Global',
            component: () => import('@/views/network/gvrp/global-settings'),
            meta: { title: 'Global Settings', icon: 'submenu' }
          },
          {
            path: 'port-settings',
            name: 'GVRP-Port',
            component: () => import('@/views/network/gvrp/port-settings'),
            meta: { title: 'Port Settings', icon: 'submenu' }
          },
          {
            path: 'time-settings',
            name: 'GVRP-Time',
            component: () => import('@/views/network/gvrp/time-settings'),
            meta: { title: 'Time Settings', icon: 'submenu' }
          }
        ]
      },
      {
        path: 'voice-vlan',
        name: 'Voice-VLAN',
        component: () => import('@/views/network/voice-vlan/index'),
        meta: { title: 'Voice VLAN', icon: 'submenu' },
        redirect: '/network/voice-vlan/settings',
        children: [
          {
            path: 'settings',
            name: 'Voice-VLAN-Settings',
            component: () => import('@/views/network/voice-vlan/settings'),
            meta: { title: 'Settings', icon: 'submenu' }
          },
          {
            path: 'oui',
            name: 'Voice-VLAN-OUI',
            component: () => import('@/views/network/voice-vlan/oui'),
            meta: { title: 'OUI', icon: 'submenu' }
          }
        ]
      },
      {
        path: 'lldp',
        name: 'LLDP',
        component: () => import('@/views/network/lldp/index'),
        meta: { title: 'LLDP', icon: 'submenu' },
        redirect: '/network/lldp/settings',
        children: [
          {
            path: 'settings',
            name: 'LLDP-Settings',
            component: () => import('@/views/network/lldp/settings'),
            meta: { title: 'Settings', icon: 'submenu' }
          },
          {
            path: 'basic-tlvs',
            name: 'LLDP-Basic-TLVs',
            component: () => import('@/views/network/lldp/basic-tlvs'),
            meta: { title: 'Basic TLVs Settings', icon: 'submenu' }
          },
          {
            path: 'dot1-tlvs',
            name: 'LLDP-Dot1-TLVs',
            component: () => import('@/views/network/lldp/dot1-tlvs'),
            meta: { title: 'Dot1 TLVs Settings', icon: 'submenu' }
          },
          {
            path: 'dot3-tlvs',
            name: 'LLDP-Dot3-TLVs',
            component: () => import('@/views/network/lldp/dot3-tlvs'),
            meta: { title: 'Dot3 TLVs Settings', icon: 'submenu' }
          },
          {
            path: 'med-port-settings',
            name: 'LLDP-MED-Port',
            component: () => import('@/views/network/lldp/med-port-settings'),
            meta: { title: 'MED Port Settings', icon: 'submenu' }
          },
          {
            path: 'statistics-information',
            name: 'LLDP-Statistics',
            component: () => import('@/views/network/lldp/statistics-information'),
            meta: { title: 'Statistics Information', icon: 'submenu' }
          },
          {
            path: 'local-port-information',
            name: 'LLDP-Local-Port',
            component: () => import('@/views/network/lldp/local-port-information'),
            meta: { title: 'Local Port Information', icon: 'submenu' }
          },
          {
            path: 'neighbors',
            name: 'LLDP-Neighbors',
            component: () => import('@/views/network/lldp/neighbors'),
            meta: { title: 'Neighbors', icon: 'submenu' }
          }
        ]
      }
    ]
  },
  /** **************** QoS ******************/
  {
    path: '/qos',
    component: Layout,
    name: 'QoS',
    meta: { title: 'QoS', icon: 'QoS' },
    redirect: '/qos/cos',
    children: [
      {
        path: 'cos',
        name: 'CoS',
        component: () => import('@/views/qos/cos'),
        meta: { title: 'CoS', icon: 'submenu' }
      },
      {
        path: 'port-pri',
        name: 'Port-Priority',
        component: () => import('@/views/qos/port-priority'),
        meta: { title: 'Port Priority', icon: 'submenu' }
      }
    ]
  },
  /** **************** PoE ******************/
  {
    path: '/poe',
    component: Layout,
    name: 'PoE',
    meta: { title: 'PoE', icon: 'PoE' },
    redirect: '/poe/cos',
    children: [
      {
        path: 'power-over-ethernet',
        name: 'Power-over-Ethernet',
        component: () => import('@/views/poe/power-over-ethernet'),
        meta: { title: 'Power over Ethernet', icon: 'submenu' }
      },
      {
        path: 'time-range',
        name: 'Time-Range',
        component: () => import('@/views/poe/time-range'),
        meta: { title: 'Time Range', icon: 'submenu' }
      },
      {
        path: 'pd-alive',
        name: 'PD-Alive',
        component: () => import('@/views/poe/pd-alive'),
        meta: { title: 'PD Alive', icon: 'submenu' }
      }
    ]
  },
  /** **************** Security ******************/
  {
    path: '/security',
    component: Layout,
    name: 'Security',
    meta: { title: 'Security', icon: 'security' },
    redirect: '/security/port-security',
    children: [
      {
        path: 'port-security',
        name: 'Port-Security',
        component: () => import('@/views/security/port-security'),
        meta: { title: 'Port Security', icon: 'submenu' },
        redirect: '/security/global-settings',
        children: [
          {
            path: 'global-settings',
            name: 'Global-Settings',
            component: () => import('@/views/security/port-security/global-settings'),
            meta: { title: 'Global Settings', icon: 'submenu' }
          },
          {
            path: 'port-settings',
            name: 'Port-Settings',
            component: () => import('@/views/security/port-security/port-settings'),
            meta: { title: 'Port Settings', icon: 'submenu' }
          },
          {
            path: 'port-address-settings',
            name: 'Port-Address-Settings',
            component: () => import('@/views/security/port-security/port-address-settings'),
            meta: { title: 'Port Address Settings', icon: 'submenu' }
          }
        ]
      },
      {
        path: 'port-access-control',
        name: 'Port-Access-Control',
        component: () => import('@/views/security/port-access-control'),
        meta: { title: 'Port Access Control', icon: 'submenu' }
      }
    ]
  },
  /** **************** Tools ******************/
  {
    path: '/tools',
    component: Layout,
    name: 'Tools',
    meta: { title: 'Tools', icon: 'tools' },
    redirect: '/tools/firmware-upgrade',
    children: [
      {
        path: 'firmware-upgrade',
        name: 'Firmware-Upgrade',
        component: () => import('@/views/tools/firmware-upgrade'),
        meta: { title: 'Firmware Upgrade', icon: 'submenu' }
      },
      {
        path: 'config-backup-restore',
        name: 'Config-Backup-Restore',
        component: () => import('@/views/tools/config-backup-restore'),
        meta: { title: 'Config Backup/Restore', icon: 'submenu' }
      },
      {
        path: 'diagnostics',
        name: 'Diagnostics',
        component: () => import('@/views/tools/diagnostics'),
        meta: { title: 'Diagnostics', icon: 'submenu' }
      },
      {
        path: 'reboot',
        name: 'Reboot',
        component: () => import('@/views/tools/reboot'),
        meta: { title: 'Reboot', icon: 'submenu' }
      },
      {
        path: 'ping',
        name: 'Ping',
        component: () => import('@/views/tools/ping'),
        meta: { title: 'Ping', icon: 'submenu' }
      }
    ]
  },
  /** **************** Save ******************/
  {
    path: '/save',
    component: Layout,
    children: [{
      path: 'save',
      name: 'Save',
      component: () => import('@/views/save'),
      meta: { title: 'Save', icon: 'save' }
    }]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
