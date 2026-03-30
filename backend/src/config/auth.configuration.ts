import { Configuration, Value } from '@itgorillaz/configify'

@Configuration()
export class AuthConfiguration {

    @Value('USER')
    user: string

    @Value('PASSWORD_SAP')
    password: string

    @Value('BASE_URL_SAP')
    baseUrlSap: string

    @Value('BASE_URL_LINK')
    baseUrlLink: string

    @Value('URL_CONTACT')
    urlContact: string

    @Value('URL_ACCOUNT')
    urlAccount: string
}