# Virtual LAN Details

## Interface model

All lab guests connect to one VLAN-aware bridge (`vmbr200` by default).

- Router VM NIC: untagged on `vmbr200` and creates VLAN subinterfaces internally.
- Client VM NICs: tagged with their VLAN IDs in Proxmox.

## IP addressing

- VLAN 20 (User): `10.20.20.0/24`, gateway `10.20.20.1`
- VLAN 30 (Server): `10.30.30.0/24`, gateway `10.30.30.1`
- VLAN 40 (Red Team): `10.40.40.0/24`, gateway `10.40.40.1`
- VLAN 50 (Detonation): `10.50.50.0/24`, gateway `10.50.50.1`
- VLAN 60 (SOC): `10.60.60.0/24`, gateway `10.60.60.1`
- VLAN 99 (Quarantine): `10.99.99.0/24`, gateway `10.99.99.1`

## DNS and DHCP

The router runs dnsmasq and serves DHCP + internal DNS records for `lab.local`.

## Isolation behavior

- Inter-VLAN forwarding default: deny
- SOC VLAN can observe all VLANs
- User VLAN can reach Server VLAN only on select TCP ports
- Red Team VLAN can reach Detonation VLAN only
- No WAN route by default
