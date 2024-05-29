import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false)
   mongoose.connect(process.env.MONGO_URL
    ).then(console.log("connected successfully"))
  }catch(e){
    console.log(e)
  }
}

export default connectDB
