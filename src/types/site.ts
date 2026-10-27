export interface ServiceArea {
  readonly name: string
  readonly district: string
  readonly state: string
}

export interface NavItem {
  readonly label: string
  readonly to: string
}

export interface ContactDetails {
  readonly phone: string
  readonly phones: readonly string[]
  readonly email: string
  readonly whatsapp: string
  readonly address: string
  readonly mapsQuery: string
}

export interface SiteConfig {
  readonly name: string
  readonly shortName: string
  readonly tagline: string
  readonly description: string
  readonly url: string
  readonly locale: string
  readonly serviceAreas: readonly ServiceArea[]
  readonly contact: ContactDetails
  readonly navigation: readonly NavItem[]
  readonly primaryCta: NavItem
}
