locals {
  vm_prefix = "game-lab"
}

resource "proxmox_virtual_environment_vm" "attacker" {
  name      = "${local.vm_prefix}-attacker"
  node_name = var.proxmox_node

  clone {
    vm_id = var.template_attacker
  }

  cpu {
    cores = var.vm_cpu.attacker
  }

  memory {
    dedicated = var.vm_ram_mb.attacker
  }

  disk {
    datastore_id = var.proxmox_datastore
    interface    = "scsi0"
    size         = 64
  }

  network_device {
    bridge = var.bridge
    vlan_id = var.vlan.attacker
  }

  initialization {
    ip_config {
      ipv4 {
        address = var.ip.attacker
        gateway = var.gateway.attacker
      }
    }
    user_account {
      username = "lab"
      keys     = [var.ssh_public_key]
    }
  }
}

resource "proxmox_virtual_environment_vm" "target1" {
  name      = "${local.vm_prefix}-target1"
  node_name = var.proxmox_node

  clone {
    vm_id = var.template_target
  }

  cpu { cores = var.vm_cpu.target }

  memory { dedicated = var.vm_ram_mb.target }

  disk {
    datastore_id = var.proxmox_datastore
    interface    = "scsi0"
    size         = 32
  }

  network_device {
    bridge  = var.bridge
    vlan_id = var.vlan.target
  }

  initialization {
    ip_config {
      ipv4 {
        address = var.ip.target1
        gateway = var.gateway.target
      }
    }
    user_account {
      username = "lab"
      keys     = [var.ssh_public_key]
    }
  }
}

resource "proxmox_virtual_environment_vm" "target2" {
  name      = "${local.vm_prefix}-target2"
  node_name = var.proxmox_node

  clone {
    vm_id = var.template_target
  }

  cpu { cores = var.vm_cpu.target }

  memory { dedicated = var.vm_ram_mb.target }

  disk {
    datastore_id = var.proxmox_datastore
    interface    = "scsi0"
    size         = 32
  }

  network_device {
    bridge  = var.bridge
    vlan_id = var.vlan.target
  }

  initialization {
    ip_config {
      ipv4 {
        address = var.ip.target2
        gateway = var.gateway.target
      }
    }
    user_account {
      username = "lab"
      keys     = [var.ssh_public_key]
    }
  }
}

resource "proxmox_virtual_environment_vm" "soc" {
  count     = var.template_soc == "" ? 0 : 1
  name      = "${local.vm_prefix}-soc"
  node_name = var.proxmox_node

  clone {
    vm_id = var.template_soc
  }

  cpu { cores = var.vm_cpu.soc }
  memory { dedicated = var.vm_ram_mb.soc }

  disk {
    datastore_id = var.proxmox_datastore
    interface    = "scsi0"
    size         = 40
  }

  network_device {
    bridge  = var.bridge
    vlan_id = var.vlan.soc
  }

  initialization {
    ip_config {
      ipv4 {
        address = var.ip.soc
        gateway = var.gateway.soc
      }
    }
    user_account {
      username = "lab"
      keys     = [var.ssh_public_key]
    }
  }
}
