# Setu: Offline LoRa Mesh Emergency Network

Setu is a 3-tier disaster response system designed for severe cyclones and floods when telecom networks and GPS infrastructure collapse.

## Research & Bibliography

Our architecture and engineering decisions are grounded in the following standards and research:

* **LoRa Signal Attenuation & Weather:** 
  Research on sub-GHz signal degradation during heavy precipitation, validating our high-density, short-hop mesh routing approach. 
  [View LoRaWAN Environmental Testing Data](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7570417/)

* **GPS Degradation During Blackouts:** 
  Official documentation on smartphone GPS accuracy dropping due to signal blockage and dense environmental cover, necessitating our fixed "Node Anchoring" methodology. 
  [View Official GPS Accuracy & Environment Factors](https://www.gps.gov/systems/gps/performance/accuracy/)

* **Captive Portal Standards (IEEE 802.11 & IETF):** 
  Specifications for utilizing standard Wi-Fi base layers combined with IETF RFC 8908 protocols for universal offline connectivity. 
  [Read IETF RFC 8908 Documentation](https://datatracker.ietf.org/doc/html/rfc8908)

* **NDRF & NDMA Standard Operating Procedures:** 
  National Disaster Management Authority guidelines outlining standard response protocols and the critical communication blackout window. 
  [View NDMA National Guidelines](https://ndma.gov.in/Governance/Guidelines)