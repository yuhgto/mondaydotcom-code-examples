import { React, useState, useEffect } from "react";
import "./App.css";
import "monday-ui-react-core/dist/main.css";
import { Sun, Send, Time, Check } from "monday-ui-react-core/icons";
import { Button, Dropdown } from "monday-ui-react-core";
// import { animateScroll as scroll } from "react-scroll";
import mondaySdk from "monday-sdk-js";

const monday = mondaySdk();

const App = () => {
  async function createContract() {
    try {
      setLoading(true);
      console.log('Button was pressed.');
      setTimeout(() => {
        setLoading(false);
      }, 500)
    } catch (error) {
      console.log(error);
    }
  }

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [context, setContext] = useState();
  const [featureName, setFeatureName] = useState('');

  
  useEffect(() => {
    monday.listen("context", (res) => {
      setContext(res.data);
      console.log('App context: ', context);
    });
  }, []);

  useEffect(() => {
    if (context) {
      const featureName = context?.appFeature?.name;
      console.log(context);
      console.log(featureName);
      const featureNamePretty = featureName.substring(0,featureName.length-8);
      setFeatureName(featureNamePretty);
    }
  }, [context])

  return (
    <div className="App">
      <div className="ButtonContainer">
        <Button
          onClick={() => createContract()}
          loading={loading}
          success={success}
          successIcon={Check}
          successText="Success"
        >
          {featureName}
        </Button>
      </div>
    </div>
  );
};

export default App;