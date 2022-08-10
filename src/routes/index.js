import { Router } from 'express'
import userRoute from './user.js' // esta es la manera de importar rutas de cada archivo accountRoute, typeRoute, etc
import categoryRoute from './category.js'
import typesRoute from './type.js'
import currencyRoute from './currency.js' // esta es la manera de importar rutas de cada archivo accountRoute, typeRoute, etc
import movementsRoute from './movement.js'
import accountsRoute from './account.js'
import favouritesRoute from './fav.js'
import ratingsRoute from './ratings.js'

const router = Router()

router.use('/user', userRoute) // esta es la forma de usar rutas de cada archivo
router.use('/category', categoryRoute)
router.use('/types', typesRoute)// esta es la forma de usar rutas de cada archivo
router.use('/currency', currencyRoute)// esta es la forma de usar rutas de cada archivo
router.use('/movement', movementsRoute)
router.use('/account', accountsRoute)
router.use('/favourites', favouritesRoute)
router.use('/ratings', ratingsRoute)

// OJO: aqui van las otras rutas para cada tabla...

export default router
