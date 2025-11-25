import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.render('admin/dashboard');
});

router.get('/index', (req, res) =>{
  res.render('landing/index')
})

export default router