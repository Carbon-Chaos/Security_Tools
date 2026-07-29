locals {
  vlan_plan = {
    user      = { vlan = 20, cidr = "10.20.20.0/24", gateway = "10.20.20.1" }
    server    = { vlan = 30, cidr = "10.30.30.0/24", gateway = "10.30.30.1" }
    redteam   = { vlan = 40, cidr = "10.40.40.0/24", gateway = "10.40.40.1" }
    detonate  = { vlan = 50, cidr = "10.50.50.0/24", gateway = "10.50.50.1" }
    soc       = { vlan = 60, cidr = "10.60.60.0/24", gateway = "10.60.60.1" }
    quarantine = { vlan = 99, cidr = "10.99.99.0/24", gateway = "10.99.99.1" }
  }

  linux_nodes = {
    kali = {
      vmid     = var.vmid_base + 1
      name     = "lab-kali"
      template = var.template_vmids.kali_linux
      vlan     = local.vlan_plan.redteam.vlan
      ip       = "10.40.40.10/24"
      gateway  = local.vlan_plan.redteam.gateway
      cores    = 2
      memory   = 4096
      disk_gb  = 40
    }
    ubuntu_victim = {
      vmid     = var.vmid_base + 2
      name     = "lab-ubuntu-victim"
      template = var.template_vmids.ubuntu_victim
      vlan     = local.vlan_plan.user.vlan
      ip       = "10.20.20.20/24"
      gateway  = local.vlan_plan.user.gateway
      cores    = 2
      memory   = 4096
      disk_gb  = 40
    }
    soc = {
      vmid     = var.vmid_base + 3
      name     = "lab-soc"
      template = var.template_vmids.soc_ubuntu
      vlan     = local.vlan_plan.soc.vlan
      ip       = "10.60.60.20/24"
      gateway  = local.vlan_plan.soc.gateway
      cores    = 4
      memory   = 8192
      disk_gb  = 80
    }
  }

  windows_nodes = var.enable_windows_victim ? {
    win11 = {
      vmid     = var.vmid_base + 4
      name     = "lab-win11-victim"
      template = var.template_vmids.windows_11
      vlan     = local.vlan_plan.server.vlan
      cores    = 4
      memory   = 8192
      disk_gb  = 80
    }
  } : {}

  router = {
    vmid     = var.vmid_base
    name     = "lab-router"
    template = var.template_vmids.router_ubuntu
    cores    = 2
    memory   = 4096
    disk_gb  = 32
  }
}
