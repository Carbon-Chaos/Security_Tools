variable "proxmox_api_url" {
  type = string
}

variable "proxmox_api_token" {
  type      = string
  sensitive = true
}

variable "proxmox_insecure_tls" {
  type    = bool
  default = true
}

variable "proxmox_node" {
  type = string
}

variable "proxmox_datastore" {
  type = string
}

variable "template_attacker" {
  type = string
}

variable "template_target" {
  type = string
}

variable "template_soc" {
  type    = string
  default = ""
}

variable "vm_cpu" {
  type = map(number)
  default = {
    attacker = 4
    target   = 2
    soc      = 2
  }
}

variable "vm_ram_mb" {
  type = map(number)
  default = {
    attacker = 8192
    target   = 4096
    soc      = 4096
  }
}

variable "ssh_public_key" {
  type = string
}

variable "bridge" {
  type    = string
  default = "vmbr1"
}

variable "vlan" {
  type = map(number)
  default = {
    attacker = 40
    target   = 30
    soc      = 60
  }
}

variable "ip" {
  type = map(string)
  default = {
    attacker = "10.40.40.10/24"
    target1  = "10.30.30.11/24"
    target2  = "10.30.30.12/24"
    soc      = "10.60.60.10/24"
  }
}

variable "gateway" {
  type = map(string)
  default = {
    attacker = "10.40.40.1"
    target   = "10.30.30.1"
    soc      = "10.60.60.1"
  }
}
