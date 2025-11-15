import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import FirebaseAdminService from 'App/services/FirebaseAdmin'

export default class AppProvider {
  constructor (protected app: ApplicationContract) {
  }

  public register () {
    // Register your own bindings
  }

  public async boot () {
    FirebaseAdminService.init()
    // IoC container is ready
  }

  public async ready () {
    // App is ready
  }

  public async shutdown () {
    // Cleanup, since app is going down
  }
}
