import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCtwP-03LTRa18mnUhAmWsc32P3ocaitv0",
  authDomain: "iideall.firebaseapp.com",
  projectId: "iideall",
  storageBucket: "iideall.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "529364386052"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default app