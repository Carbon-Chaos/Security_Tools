resource "proxmox_virtual_environment_vm" "router" {
  vm_id     = local.router.vmid
  name      = local.router.name
  node_name = var.target_node
  on_boot   = var.vm_start_on_boot

  clone {
    vm_id = local.router.template
    full  = true
  }

  cpu {
    cores = local.router.cores
    type  = "x86-64-v2-AES"
  }

  memory {
    dedicated = local.router.memory
  }

  disk {
    datastore_id = var.datastore_id
    interface    = "scsi0"
    iothread     = true
    size         = local.router.disk_gb
    discard      = "on"
    ssd          = true
  }

  agent {
    enabled = true
  }

  network_device {
    bridge = var.lab_bridge
    model  = "virtio"
  }

  initialization {
    user_account {
      username = var.linux_vm_username
      password = var.linux_vm_password
      keys     = [var.ssh_public_key]
    }

    ip_config {
      ipv4 {
        address = "dhcp"
      }
    }
  }
}

resource "proxmox_virtual_environment_vm" "linux_nodes" {
  for_each  = local.linux_nodes
  vm_id     = each.value.vmid
  name      = each.value.name
  node_name = var.target_node
  on_boot   = var.vm_start_on_boot

  clone {
    vm_id = each.value.template
    full  = true
  }

  cpu {
    cores = each.value.cores
    type  = "x86-64-v2-AES"
  }

  memory {
    dedicated = each.value.memory
  }

  disk {
    datastore_id = var.datastore_id
    interface    = "scsi0"
    iothread     = true
    size         = each.value.disk_gb
    discard      = "on"
    ssd          = true
  }

  agent {
    enabled = true
  }

  network_device {
    bridge  = var.lab_bridge
    model   = "virtio"
    vlan_id = each.value.vlan
  }

  initialization {
    user_account {
      username = var.linux_vm_username
      password = var.linux_vm_password
      keys     = [var.ssh_public_key]
    }

    ip_config {
      ipv4 {
        address = each.value.ip
        gateway = each.value.gateway
      }
    }
  }

  depends_on = [proxmox_virtual_environment_vm.router]
}

resource "proxmox_virtual_environment_vm" "windows_nodes" {
  for_each  = local.windows_nodes
  vm_id     = each.value.vmid
  name      = each.value.name
  node_name = var.target_node
  on_boot   = var.vm_start_on_boot

  clone {
    vm_id = each.value.template
    full  = true
  }

  cpu {
    cores = each.value.cores
    type  = "x86-64-v2-AES"
  }

  memory {
    dedicated = each.value.memory
  }

  disk {
    datastore_id = var.datastore_id
    interface    = "scsi0"
    iothread     = true
    size         = each.value.disk_gb
    discard      = "on"
    ssd          = true
  }

  network_device {
    bridge  = var.lab_bridge
    model   = "virtio"
    vlan_id = each.value.vlan
  }

  initialization {
    ip_config {
      ipv4 {
        address = "dhcp"
      }
    }
  }

  depends_on = [proxmox_virtual_environment_vm.router]
}
