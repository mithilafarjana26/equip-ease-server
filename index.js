import express from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
const app = express()
const port = process.env.PORT||5000
app.use(cors())
app.use(express.json())


const client = new MongoClient(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7nx6agq.mongodb.net/`);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const connectMongo=await connectToMongoDB()

const myDB = connectMongo.db("equip-ease-server");
const allUsers = myDB.collection("user");
const allCategories = myDB.collection("categories");
const allApplications = myDB.collection("application");



//user
app.get('/user',async(req,res)=>{
  const query={}
  const result = await allUsers.find(query).toArray()
  res.send(result)
})


// equipment api
app.post('/categories',async(req,res)=>{
  const newCategories = req.body
  // console.log(newCategories)
  const result = await allCategories.insertOne(newCategories);
  res.send(result)
})

//get categories




app.get('/categories', async (req, res) => {
    try {
        const query = {};

        const {
            equipmentName,
            location,
            category,
            brand,
            price,
            search
        } = req.query;

        // Equipment Name Filter
        if (equipmentName) {
            query.equipmentName = {
                $regex: equipmentName,
                $options: "i"
            };
        }

        // Location Filter
        if (location) {
            query.location = {
                $regex: location,
                $options: "i"
            };
        }

        // Category Filter
        if (category) {
            query.category = category;
        }

        // Brand Filter
        if (brand) {
            query.brand = brand;
        }

        // Price Range Filter
        if (price && price !== "all") {
            const [minPrice, maxPrice] = price.split("-").map(Number);

            query.rentalPrice = {
                $gte: minPrice,
                $lte: maxPrice
            };
        }

        // Search Filter
        if (search) {
            query.$or = [
                {
                    equipmentName: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    terms: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    brand: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        console.log("MongoDB Query:", query);

        const result = await allCategories.find(query).toArray();

        res.status(200).send(result);

    } catch (error) {
        console.error("Categories API Error:", error);

        res.status(500).send({
            message: "Failed to get categories",
            error: error.message
        });
    }
});




//get 1 categories

app.get('/categories/:id', async (req, res) => {
    const { id } = req.params;

    const result = await allCategories.findOne({
        _id: new ObjectId(id)
    });

    res.send(result);
});


//delete category
app.delete('/categories/:id',async(req,res)=>{
  const id = req.params.id
  const query = {
    $or:[
      {_id: new ObjectId(id)},
      {_id:id}
    ]
  }
   const result =await allCategories.deleteOne(query)
  res.send(result)
})



//post applicant

app.post('/application',async(req,res)=>{
  const newApplication = req.body
//   console.log(newApplication)
  const result = await allApplications.insertOne(newApplication)
  res.send(result)
})

//get applications

app.get('/application',async(req,res)=>{
    const query ={}
      if(req.query.applicantId){
    query.userId=req.query.applicantId
  }
  if(req.query.categoryId){
    query.categoryId=req.query.categoryId
  }
      const cursor= allApplications.find(query)
  const result = await cursor.toArray()
  res.send(result)
})


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})