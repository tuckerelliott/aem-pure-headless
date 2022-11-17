import React, { useState, useEffect } from 'react';
import Navigation from '../../components/navigation';
import { marked } from 'marked';
import './settings.css';
import endpoint from './endpoint.md';
import serviceURL from './serviceURL.md';
import auth from './auth.md';
import { AEMHeadless } from '@adobe/aem-headless-client-js';

const instructionsData = {
  'serviceURL': serviceURL,
  'auth': auth,
  'endpoint': endpoint,
  'authenticate': 'My error message',
  'project': auth
};


export const expiry = () => {
  const now = new Date();
  if (localStorage.getItem('expiry') && (now.getTime() > localStorage.getItem('expiry'))) {
    localStorage.removeItem('expiry');
    localStorage.removeItem('auth');
    return false;
  } else if (!localStorage.getItem('expiry')) {
    return false;
  } else {
    return true;
  }
};

// const Settings = () => {
//   const [success, setSuccess] = useState(0);

//   const navigate = useNavigate();
//   return success ? navigate('/aem-pure-headless', { state: 'pass-data' } ) : <SettingComp success={setSuccess} />;

// };

const Settings = () => {
  const [instructions, setInstructions] = useState('');
  // const [payload, setPayload] = useState('');

  // const [expir, setExpiry] = useState('');
  const [endpoint, setEndpoint] = useState('/content/_cq_graphql/gql-demo/endpoint.json');
  const [project, setProject] = useState('/content/dam/gql-demo');
  const [loggedin, setLoggedin] = useState(0);
  const [auth, setAuth] = useState('');
  const [serviceURL, setServiceURL] = useState('');
  const [config, setConfig] = useState();

  const getConfiguration = React.useCallback(() => {
    const now = new Date();

    syncLocalStorage('serviceURL', serviceURL);
    syncLocalStorage('endpoint', endpoint);
    syncLocalStorage('auth', auth);
    syncLocalStorage('project', project);


    if (localStorage.getItem('expiry') === null)
      localStorage.setItem('expiry', now.getTime() + 82800000);

    const sdk = new AEMHeadless({
      serviceURL: localStorage.getItem('serviceURL'),
      endpoint: localStorage.getItem('endpoint'),
      auth: localStorage.getItem('auth')
    });

    sdk.runPersistedQuery('gql-demo/configuration')
      .then(({ data }) => {

        if (data) {
          console.log(data);
          setConfig(<Navigation logo={data.configurationByPath.item.siteLogo} />);
          localStorage.setItem('loggedin', 1);
        }
      })
      .catch((error) => {
        // if (error && error.toJSON().message.includes('There was a problem parsing response data')) {
        //   instructionsData[e.target.name] = `<h5>Error</h5> 403 Error for ${document.querySelector('.author-url').value}`;
        //   setInstructions(e.target);
        //   localStorage.setItem('loggedin', 0);
        // }
        // //console.log('here');
        // console.log(JSON.stringify(error));
        console.log(error);
      });
  }, [auth, endpoint, project, serviceURL]);


  useEffect(() => {
    for (let [key, value] of Object.entries(instructionsData)) {
      fetch(value)
        .then((r) => r.text())
        .then(text => {
          instructionsData[key] = marked.parse(text);
        });
    }



    syncState('endpoint', setEndpoint);
    syncState('auth', setAuth);
    syncState('project', setProject);
    syncState('loggedin', setLoggedin);
    syncState('serviceURL', setServiceURL);

    // if (!expiry()) {
    //   setAuth('');
    //   localStorage.setItem('auth', '');
    // }

    if (auth && endpoint && project && serviceURL && loggedin)
      getConfiguration();

  }, [auth, endpoint, getConfiguration, loggedin, project, serviceURL]);

  const syncState = (value, func) => {
    localStorage.getItem(value) && func(localStorage.getItem(value));
  };

  const syncLocalStorage = (key, value) => {
    localStorage.setItem(key, value);
  };

  return (
    <React.Fragment>
      <header>{config}</header>
      <div className='main-body settings'>
        <div className='settings-form'>
          <form>
            <label>Author URL
              <input className='author-url'
                type='text'
                placeholder='Enter the URL of your author environment'
                name='serviceURL'
                onSelect={(e) => setInstructions(e.target)}
                value={serviceURL}
                onChange={(e) => setServiceURL(e.target.value)}>

              </input>
            </label>
            <label>Developer Token
              <textarea className='developer-token'
                type='text'
                rows={28}
                placeholder='Paste your Bearer Token'
                name='auth'
                onSelect={(e) => setInstructions(e.target)}
                value={auth}
                onChange={(e) => setAuth(e.target.value)}>
              </textarea>
            </label>
            <label>GraphQL Endpoint
              <input className='graphql-endpoint'
                type='text'
                placeholder='/content/_cq_graphql/gql-demo/endpoint.json'
                name='endpoint'
                onSelect={(e) => setInstructions(e.target)}
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}>
              </input>
            </label>
            <label>Project Name
              <input className='shared-project'
                type='text'
                placeholder='/content/dam/gql-demo'
                name='project'
                onSelect={(e) => setInstructions(e.target)}
                value={project}
                onChange={(e) => setProject(e.target.value)}></input>
            </label>
            <button className='button'
              type='button'
              name='authenticate'
              onClick={(e) => getConfiguration(e)}>Authenticate</button>
          </form>
          <div className='instructions' dangerouslySetInnerHTML={{ __html: instructionsData[instructions.name] }}>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

// SettingComp.propTypes = {
//   success: PropTypes.func
// };

export default Settings;