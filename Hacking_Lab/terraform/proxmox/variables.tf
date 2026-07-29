variable "proxmox_api_url" {
  description = "Proxmox API endpoint, example: https://pve.local:8006/api2/json"
  type        = string
}

variable "proxmox_username" {
  description = "Proxmox user, example: terraform@pve"
  type        = string
  default     = null
}

variable "proxmox_password" {
  description = "Password for proxmox_username"
  type        = string
  sensitive   = true
  default     = null
}

variable "proxmox_api_token" {
  description = "API token in format user@realm!token=secret"
  type        = string
  sensitive   = true
  default     = null
}

variable "proxmox_insecure" {
  description = "Set true when using self-signed TLS certs"
  type        = bool
  default     = true
}

variable "target_node" {
  description = "Proxmox node where VMs are created"
  type        = string
}

variable "datastore_id" {
  description = "Storage for VM disks"
  type        = string
}

variable "iso_datastore_id" {
  description = "Storage where cloud image/template snippets are accessible"
  type        = string
}

variable "lab_bridge" {
  description = "VLAN-aware bridge carrying lab traffic (internal-only bridge strongly recommended)"
  type        = string
  default     = "vmbr200"
}

variable "vm_start_on_boot" {
  description = "Start VMs on hypervisor boot"
  type        = bool
  default     = false
}

variable "linux_vm_username" {
  description = "Default cloud-init username for Linux VMs"
  type        = string
  default     = "labuser"
}

variable "linux_vm_password" {
  description = "Default cloud-init password for Linux VMs"
  type        = string
  sensitive   = true
}

variable "ssh_public_key" {
  description = "SSH public key inserted into Linux VMs"
  type        = string
}

variable "vmid_base" {
  description = "Base VMID for generated nodes"
  type        = number
  default     = 8100
}

variable "template_vmids" {
  description = "Template VMIDs prebuilt in Proxmox"
  type = object({
    router_ubuntu = number
    kali_linux    = number
    ubuntu_victim = number
    soc_ubuntu    = number
    windows_11    = number
  })
}

variable "enable_windows_victim" {
  description = "If false, skips Windows victim creation"
  type        = bool
  default     = false
}
