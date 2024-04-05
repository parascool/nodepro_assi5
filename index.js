// import express from 'express';
// import mongoose from 'mongoose';
// import bodyParser from 'body-parser';
// import path from 'path';
// import ejs from 'ejs'
// import nodemailer from 'nodemailer';
// import Order from './models/order.js'
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const Order = require('./models/order.js')

const app = express();
const PORT = process.env.PORT || 8000;

mongoose.connect('mongodb://localhost:27017/orderDB')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

  
  app.use(bodyParser.urlencoded({ extended: true }));
  // const __dirname = path.dirname(new URL(import.meta.url).pathname);
  
  
  const publicPath = path.join(__dirname,  '/public');
  console.log(publicPath);
  app.use(express.static(publicPath));
  app.set("views", "./src/views")
  app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('orderForm');
});

app.post('/submitOrder', async (req, res) => {
  const { name, address, email, items } = req.body;
  const order = new Order({
    name,
    address,
    email,
    items: Array.isArray(items) ? items : [items]
  });
  try {
    await order.save();
    res.send('Order submitted successfully.');
  } catch (error) {
    console.error('Error submitting order:', error);
    res.status(500).send('An error occurred while submitting the order.');
  }
});


app.get('/admin', async (req, res) => {
    try {
      const orders = await Order.find();
      const currentDate = new Date();
      orders.forEach(order => {
        const differenceInDays = Math.floor((currentDate - order.orderedDate) / (1000 * 60 * 60 * 24));
        if (differenceInDays === 0) {
          order.status = 'In Progress';
        } else if (differenceInDays === 1) {
          order.status = 'Dispatched';
        } else if (differenceInDays === 2) {
          order.status = 'Delivered';
        }
      });
      res.render('adminDashboard', { orders });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).send('An error occurred while fetching orders.');
    }
  });
  
  app.post('/sendEmail/:id', async (req, res) => {
    const orderId = req.params.id;
    try {
      const order = await Order.findById(orderId);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sachinbale2001@gmail.com', 
          pass: 'Iamsachin@2001' 
        }
      });
      const mailOptions = {
        from: 'sachinbale2001@gmail.com',
        to: order.email,
        subject: 'Order Status Update',
        text: `Dear ${order.name},\n\nYour order status is currently: ${order.status}.\n\nRegards,\nAdmin`
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          res.status(500).send('An error occurred while sending the email.');
        } else {
          console.log('Email sent:', info.response);
          res.send('Email sent successfully.');
        }
      });
    } catch (error) {
      console.error('Error fetching order or sending email:', error);
      res.status(500).send('An error occurred while fetching order or sending email.');
    }
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




