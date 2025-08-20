import { Router, AxonCookie } from '../../src';

// you can set route prefix in Router
const router = Router('/api/v1');

router.get('/{name}([a-z]+)/{id}(\\d+)', async (req, res) => {
  return res.status(200).body({
    url: req.url,
    params: req.params,
    query: req.query,
  });
});

// set cookie
router.post('hello', async (req, res) => {
  AxonCookie.set(res, 'user', 'Asal <3', {
    sameSite: 'Strict',
    duration: '1d',
    domain: '127.0.0.1',
    httpOnly: true,
    path: '/api/v1/hello',
    secure: true,
  });

  return res.status(201).body({
    message: 'Cookie set successfuly',
  });
});

// get cookie
router.get('hello', async (req, res) => {
  return res.status(200).body({
    cookie: AxonCookie.parse(req),
  });
});

// delete cookie
router.delete('hello', async (req, res) => {
  // All options which used while creating cookie must set for removing cookie.
  AxonCookie.clear(res, 'user', {
    sameSite: 'Strict',
    domain: '127.0.0.1',
    httpOnly: true,
    path: '/api/v1/hello',
    secure: true,
  });

  return res.status(200).body({
    message: 'Cookie cleared successfuly',
  });
});

export { router as v2Routes };
