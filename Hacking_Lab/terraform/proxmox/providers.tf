provider "proxmox" {
  endpoint  = var.proxmox_api_url
  username  = var.proxmox_username
  password  = var.proxmox_password
  insecure  = var.proxmox_insecure
  api_token = var.proxmox_api_token

  ssh {
    agent = true
  }
}
