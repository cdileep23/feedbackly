import express from 'express'
import { submitFeedbackResponse } from '../controllers/feedbackresponse.controller.js'

const responseRouter=express.Router()
responseRouter.route('/submit').post(submitFeedbackResponse)

export default responseRouter

