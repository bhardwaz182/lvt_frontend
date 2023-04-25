import axios from "axios";
import { useEffect, useState } from "react";
import Dropdown from "./components/Dropdown/Dropdown";
import { Accordion, Button, Card, Table, Form, Navbar, Container } from "react-bootstrap";

function App() {
  const [joblist, setJoblist] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filter, setFilter] = useState({ region: [], jobType: [] });
  const [customerDetails, setCustomerDetails] = useState({});
  const [quotationDetails, setQuotationDetails] = useState({});
  const [displayForm, setDisplayForm] = useState(0);
  const [displayCreateJob, setDisplayCreateJob] = useState(false);
  const [accordian, setAccordian] = useState({jobid:0,category:""});
  const [jobImages, setJobImages] = useState({});

  const getCustomerDetails = async (job_id) => {
    if (customerDetails[job_id]) {
      return;
    }
    const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/customer/${job_id}`);
    setCustomerDetails({...customerDetails, [job_id]:data});
    setAccordian({jobid:job_id,category:"customer"});
  }
  const getQuotationDetails = async (job_id) => {
    if (quotationDetails[job_id]) {
      return;
    }
    const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/quotations/${job_id}`);
    setQuotationDetails({...quotationDetails, [job_id]:data});
    setAccordian({jobid:job_id,category:"quotation"});
  }
  const getImageDetails = async (job_id) => {
    if (jobImages[job_id]) {
      return;
    }
    const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/images/${job_id}`);
    setJobImages({...jobImages, [job_id]:data});
  }

  const onFormSubmit = (eve) => {
    const { name, email, comments, price, location } = eve.target;
    axios.post(`${process.env.REACT_APP_API_BASE_URL}/addQuotations`, { comments:comments.value, job_id: displayForm, name:name.value, email:email.value, price:price.value, location:location.value })
      .then((res) => {
        if (res.status === 200) {
          
          if (res.data.status==="added"){
            if(quotationDetails[displayForm]){
              setQuotationDetails({...quotationDetails, [displayForm]:[...quotationDetails[displayForm], {
                maker_name: name.value,maker_email:email.value, comments:comments.value, price: parseFloat(price.value), job_id: displayForm, maker_id: res.data[0].maker_id, maker_location: location.value
              }]});
            }
            // setQuotationDetails([...quotationDetails, {
            //   maker_name: name.value,maker_email:email.value, comments:comments.value, price: parseFloat(price.value), job_id: displayForm, maker_id: res.data[0].maker_id, location: location.value
            // }]);
          }else{
            setQuotationDetails({...quotationDetails, [displayForm]:quotationDetails[displayForm].map((quotation) => {
              if (quotation.maker_id === res.data[0].maker_id) {
                return { ...quotation, comments: comments.value, price: parseFloat(price.value), location: location.value }
              }
              return quotation;
            })});
            // setQuotationDetails(quotationDetails.map((quotation) => {
            //   if (quotation.maker_id === res.data[0].maker_id) {
            //     return { ...quotation, comments: comments.value, price: parseFloat(price.value), location: location.value }
            //   }
            //   return quotation;
            // }))
          }
          
          setJoblist(joblist.map((job) => {
            if (job.job_id === displayForm) {
              if (res.data.status==="added"){
                return { ...job, quotation_count: parseInt(job.quotation_count) + 1 }
              }
            }
            return job;
          }))
          setDisplayForm(0);
        }
      });
  }

  const createJob = (eve) => {
    eve.preventDefault();
    // console.log(eve);
    // const form = new FormData(eve.target);
    // const formula = form.get("formFirstName");
    // console.log(formula);
    const firstName = eve.target[0].value;
    const lastName = eve.target[1].value;
    const phoneNumber = eve.target[2].value;
    const email = eve.target[3].value;
    const typeOfClothing = eve.target[4].value;
    const description = eve.target[5].value;
    const budget = eve.target[6].value;
    const images = eve.target[7].files;
    const address = eve.target[8].value;
    const postcode = eve.target[9].value;
    const state = eve.target[10].value;
    console.log(images);
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('phoneNumber', phoneNumber);
    formData.append('email', email);
    formData.append('typeOfClothing', typeOfClothing);
    formData.append('address', address);
    formData.append('postcode', postcode);
    formData.append('state', state);
    formData.append('description', description);
    formData.append('budget', budget);
    formData.append('images', images[0]);

    axios.post(`${process.env.REACT_APP_API_BASE_URL}/addjob`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then((res) => {
        if (res.status === 200) {
          setDisplayCreateJob(false);
          setJoblist([...joblist, 
            {
              "job_id": res.data[0].job_id,
              "job_type": typeOfClothing,
              "making": "Custom-made",
              "status": "Open",
              "quotation_count": 0,
              "address": address,
              "state": state,
              "budget": budget,
          }
        ]);
        }
      })
  }

  const onRegionSelect = (value) => {
    setFilter({ ...filter, region: value });
  }

  const onJobTypeSelect = (value) => {
    setFilter({ ...filter, jobType: value });
  }


  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/listjobs`);
      setJoblist(data);
      setFilteredJobs(data);
    }
    fetchJobs();
  }, [])

  useEffect(() => {
    const jobsRegionFiltered = joblist.filter((job) => filter.region.length ? filter.region.map((region) => region.value).includes(job.state) : [...joblist]);
    const jobsJobTypeFiltered = jobsRegionFiltered.filter((job) => filter.jobType.length ? filter.jobType.map((jobType) => jobType.value).includes(job.job_type) : [...jobsRegionFiltered]);
    setFilteredJobs(jobsJobTypeFiltered);
  }, [filter, joblist])
  // console.log("customerDetails",customerDetails);
  return (
    <div className="App" style={{background:"#eee"}}>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">
            <img
              alt=""
              src="https://media.licdn.com/dms/image/C510BAQFgpxmUUpFySg/company-logo_200_200/0/1557838792383?e=1689811200&v=beta&t=OJq80h606d07nent6_hR84RYVZtSIyC4Yv8KeXwFjNg"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{' '}
            Meydit
          </Navbar.Brand>
        </Container>
      </Navbar>
      <Container>
      {
        !displayCreateJob ?
          <div style={{ display: "flex", justifyContent: "space-between", margin: "2%" }}>
            <Button variant="primary" onClick={() => setDisplayCreateJob(true)} >Create New Job</Button>
            <div>
              Filter :
              <Dropdown
                isSearchable
                isMulti
                placeHolder="Select a region"
                options={[...new Set(joblist.map((job) => job.state))].map((state) => ({ value: state, label: state }))}
                onChange={(value) => onRegionSelect(value)}
              />
              <Dropdown
                isSearchable
                isMulti
                placeHolder="Select a job type"
                options={[...new Set(joblist.map((job) => job.job_type))].map((state) => ({ value: state, label: state }))}
                onChange={(value) => onJobTypeSelect(value)}
              />
            </div>
          </div>
          : ""
      }

      {
        displayCreateJob ?
          <div style={{ position: "absolute", top: "", width: "100%", zIndex: "1", backgroundColor: "rgba(255,255,255,0.9)",paddingBottom:"4%" }}>
            <Form onSubmit={(eve) => createJob(eve)} style={{ width: "50%", margin: "0 auto", padding: "2% 0" }}>
              <Form.Group className="mb-3" controlId="formFirstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" placeholder="Enter first name" name="firstName" required/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formLastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" placeholder="Enter last name" name="lastName" required/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formPhoneNumber">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control type="number" placeholder="Enter Phone Number" name="phoneNumber" required/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" name="email" required/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formTypeOfClothing">
                <Form.Label>Type of Clothing</Form.Label>
                <select className="form-select" aria-label="Default select example" name="typeOfClothing" required>
                  <option value="Dress">Dress</option>
                  <option value="Ethnic Wear">Ethnic Wear</option>
                  </select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" placeholder="Enter Description" name="description" required/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBudget">
                <Form.Label>Budget</Form.Label>
                <Form.Control type="number" placeholder="Enter Budget" name="budget" defaultValue={0}/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formImages">
                <Form.Label>Images</Form.Label>
                <Form.Control type="file" placeholder="Upload Images" name="image" multiple/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formAddress">
                <Form.Label>Address</Form.Label>
                <Form.Control type="text" placeholder="Address" required/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formPostcode">
                <Form.Label>Postcode</Form.Label>
                <Form.Control type="number" placeholder="Enter Postcode" required/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formState">
                <Form.Label>State</Form.Label>
                <Form.Control type="text" placeholder="State" required/>
              </Form.Group>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Button variant="success" type="submit">
                  Submit
                </Button>
                <Button variant="danger" onClick={() => setDisplayCreateJob(false)}>
                  Cancel
                </Button>
              </div>
            </Form></div>
          : ""
      }
      <div style={{ margin: "2%" }}>
        {
          filteredJobs.map((job, index) => {
            return (
              <>
                <Card key={index} style={{ margin: "2% 0",backgroundColor:"#DBE2EF" }}>
                  <Card.Body>
                    <Card.Title>{job.job_type}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{job.description}</Card.Subtitle>
                    <Card.Text>Budget : {job.budget}</Card.Text>
                    {/* <Card.Text>Image : <img src={job.image_url} alt="Dress"/></Card.Text> */}
                    <Card.Text>
                      {/* {job.description} */}
                      <Accordion style={{backgroundColor:"#FEFBF6"}} defaultActiveKey={accordian.jobid===job.job_id?accordian.category==="customer"?0:1:""}>
                        <Accordion.Item eventKey="0" onClick={() => { getCustomerDetails(job.job_id) }} >
                          <Accordion.Header>Cutomer Details</Accordion.Header>
                          <Accordion.Body>
                            {

                              // console.log("customerDetails",customerDetails)
                              customerDetails[job.job_id]?customerDetails[job.job_id].map((customer, index) => {
                                return (
                                  <Table key={index}>
                                    <tbody>
                                      <tr>
                                        <td>Name </td>
                                        <td>
                                          {customer.first_name} {customer.last_name}
                                        </td>
                                      </tr>

                                      <tr>
                                        <td>Email </td>
                                        <td>
                                          {customer.email_address}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>Phone </td>
                                        <td>{customer.phone_number}</td>
                                      </tr>
                                      <tr>
                                        <td>Address </td>
                                        <td>{customer.address}</td>
                                      </tr>
                                      <tr>
                                        <td>Postcode </td>
                                        <td>{customer.postcode}</td>
                                      </tr>
                                      <tr>
                                        <td>State </td>
                                        <td>{customer.state}</td>
                                      </tr>
                                    </tbody>
                                  </Table>
                                )
                              }):""
                            }
                          </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1" onClick={() => getImageDetails(job.job_id)}>
                          <Accordion.Header>Images</Accordion.Header>
                          <Accordion.Body>
                            {
                              jobImages[job.job_id]?jobImages[job.job_id].map((image, index) => {
                                return (
                                    <img src={image.image_url} height={100} width={100} alt="Dress" />
                                )
                              }):""
                            }
                            </Accordion.Body>
                            </Accordion.Item>
                        <Accordion.Item eventKey="2" onClick={() => getQuotationDetails(job.job_id)}>
                          <Accordion.Header>Quotations : {job.quotation_count}</Accordion.Header>
                          <Accordion.Body>
                            <form onSubmit={(eve) => { eve.preventDefault(); onFormSubmit(eve); }}>
                              <Table striped bordered hover >
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Location</th>
                                    <th>Comments</th>
                                    <th>price</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {
                                    quotationDetails[job.job_id]?quotationDetails[job.job_id].map((quotation, index) => {
                                      return (
                                        <tr key={index}>
                                          <td>{index + 1}</td>
                                          <td>{quotation.maker_name}</td>
                                          <td>{quotation.maker_email}</td>
                                          <td>{quotation.maker_location}</td>
                                          <td>{quotation.comments}</td>
                                          <td>{quotation.price}</td>
                                        </tr>
                                      )
                                    }):""
                                  }

                                  {
                                    displayForm === job.job_id ?
                                      <tr>
                                        <td><Button variant="success" type="submit">submit</Button></td>
                                        <td><input type="text" name="name" required/></td>
                                        <td><input type="email" name="email" required/></td>
                                        <td><input type="text" name="location" /></td>
                                        <td><input type="text" name="comments" /></td>
                                        <td><input type="number" name="price" required/></td>
                                      </tr>
                                      : ""
                                  }

                                  <Button variant={displayForm === job.job_id ? "danger" : "primary"} onClick={() => displayForm === job.job_id ? setDisplayForm(0) : setDisplayForm(job.job_id)} style={{ margin: "2% 0" }}>{displayForm === job.job_id ? "Cancel" : "Add Quotation"}</Button>
                                </tbody>
                              </Table>
                            </form>
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </>
            )

          })}
          
      </div>
      </Container>
    </div>
  );
}

export default App;
