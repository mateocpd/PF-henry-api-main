import jwt from 'jsonwebtoken'

export default (req, res, next) => {
  const auth = req.get('authorization')
  let Token = null

  if (auth && auth.toLowerCase().startsWith('bearer')) {
    Token = auth.split(' ')[1]
  }

  if (Token === null) {
    res.status(401).json({ error: 'Token does not exist' }).end()
  }

  try {
    const decodeToken = jwt.verify(Token, process.env.JWT)
    const { userID } = decodeToken
    req.userToken = userID
  } catch (error) {
    res.status(401).json({ error: 'Token invalid' }).end()
    next(error)
  }

  next()
}
