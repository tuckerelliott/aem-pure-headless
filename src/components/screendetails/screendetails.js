import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useErrorHandler } from 'react-error-boundary';
import Header from '../header';
import Footer from '../footer';
import './screendetails.css';
import { prepareRequest } from '../../utils';

const Screendetails = () => {
  const handleError = useErrorHandler();

  const [config, setConfiguration] = useState('');
  const [content, setContent] = useState({});
  const [title, setTitle] = useState('');

  const props = useParams();
  const navigate = useNavigate();

  const version = localStorage.getItem('rda') === 'v1' ? 'v1' : 'v2';
  const configPath = `/content/dam/${localStorage.getItem('project')}/site/configuration/configuration`;
  let loggedin = JSON.parse(localStorage.getItem('loggedin'));

  useEffect(() => {
    if (!loggedin) navigate('/settings');
    
    let path = Object.values(props).pop();

    const findOverlap = (a, b) => {
      if (b.length === 0) return '';
      if (a.endsWith(b)) return b;
      if (a.indexOf(b) > 0) return b;
      return findOverlap(a, b.substring(0, b.length - 1));
    };

    const sdk = prepareRequest();

    sdk.runPersistedQuery('aem-demo-assets/gql-demo-configuration', { path: configPath })
      .then(({ data }) => {
        if (data) {

          setConfiguration(data);

          if (data && data.configurationByPath) {
            let ovlp = findOverlap(data.configurationByPath.item.adventuresHome, path);
            path = data.configurationByPath.item.adventuresHome + path.replace(ovlp, '');
          }

          sdk.runPersistedQuery(`aem-demo-assets/gql-demo-adventure-${version}`, { path: path !== '' ? path : data.configurationByPath.item.homePage._path })
            .then(({ data }) => {
              if (data) {
               
                let pretitle = data.adventureByPath.item.description.plaintext;
                pretitle = pretitle && pretitle.substring(0, pretitle.indexOf('.'));

                let content = {

                  screen: {
                    body: {
                      header: {
                        navigationColor: 'light-nav',
                        teaser: {
                          __typename: 'TeaserModel',
                          asset: data.adventureByPath.item.primaryImage,
                          title: data.adventureByPath.item.title,
                          preTitle: pretitle,
                          _metadata: data.adventureByPath.item._metadata,
                          style: 'hero',
                          _path: data.adventureByPath.item._path
                        }
                      }

                    }
                  }
                };
                setTitle(data.adventureByPath.item.title);

                setContent(content);
              }
            })
            .catch((error) => {
              handleError(error);
            });
        }
      })
      .catch((error) => {
        handleError(error);
      });


  }, [handleError, navigate, loggedin, configPath, props, version]);

  document.title = title;
  return (
    <React.Fragment>
      {content && content.screen && config.configurationByPath &&

        <Header data={content} config={config} className='screendetail' />
      }

      <div className='main-body'>

        <div>TBD</div>

      </div>
      <footer>
        {config.configurationByPath && config.configurationByPath.item.footerExperienceFragment &&
          <Footer config={config.configurationByPath.item.footerExperienceFragment} />
        }
      </footer>
    </React.Fragment >
  );
};

export default Screendetails;