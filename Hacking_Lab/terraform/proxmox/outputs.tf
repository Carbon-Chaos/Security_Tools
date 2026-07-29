output "router_vm" {
  description = "Router VM metadata"
  value = {
    id   = proxmox_virtual_environment_vm.router.vm_id
    name = proxmox_virtual_environment_vm.router.name
  }
}

output "linux_vms" {
  description = "Linux VM metadata"
  value = {
    for k, vm in proxmox_virtual_environment_vm.linux_nodes :
    k => {
      id   = vm.vm_id
      name = vm.name
    }
  }
}

output "windows_vms" {
  description = "Windows VM metadata"
  value = {
    for k, vm in proxmox_virtual_environment_vm.windows_nodes :
    k => {
      id   = vm.vm_id
      name = vm.name
    }
  }
}

output "vlan_plan" {
  description = "Segmented virtual LAN plan"
  value       = local.vlan_plan
}
