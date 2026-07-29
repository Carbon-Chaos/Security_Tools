output "attacker_ip" {
  value = var.ip.attacker
}

output "target_ips" {
  value = [var.ip.target1, var.ip.target2]
}

output "soc_ip" {
  value = var.template_soc == "" ? null : var.ip.soc
}
