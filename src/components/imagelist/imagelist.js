import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { LinkManager, externalizeImages, MagazineStore } from '../../utils';

import './imagelist.css';

export const ImageListGQL = `
...on ImageListModel {
  _model {
    title
    _path
  }
  _metadata {
    stringMetadata {
      value
    }
  }
  imageListItems {
    ...on PageRef {
      _authorUrl
      _publishUrl
    }
  }
}`;

const promises = [];
const ImageList = ({ content }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    content.imageListItems.map(({ _path, _authorUrl }) => {
      let promise = fetch(_authorUrl.replace('.html', '.content.html'), {
        method: 'get',
        headers: new Headers({
          'Authorization': `Bearer ${localStorage.auth}`,
          'Content-Type': 'text/html'
        })
      }).then(res => ({
        res: res.text().then(html => {
          if (html) {
            let body = new DOMParser().parseFromString(html, 'text/html');
            let title = body.querySelector('h1');
            let image = body.querySelector('.cmp-image');
            image = externalizeImages(image.innerHTML);

            setItems((item) => {
              MagazineStore(LinkManager(_path), { path: _path, article: body });

              return [...item, { title: title.innerHTML, image: image, path: _path }];
            });

          }
        }).catch(err => console.log(err)), promise: 'promise'
      }));

      promises.push(promise);
    });

    Promise.all(promises);

  }, [content.imageListItems]);

  return (
    <React.Fragment>
      <div className='image-list-container'>
        {content._metadata.stringMetadata[0].value && <h4>{content._metadata.stringMetadata[0].value}</h4>}
        <ul className='image-list'>
          {[...new Map(items.map(itm => [itm['path'], itm])).values()].map((item) => (
            <Card key={item.title} item={item} />
          ))}
        </ul>
      </div>
    </React.Fragment>
  );
};

ImageList.propTypes = {
  content: PropTypes.object
};

const Card = ({item}) => {
  return (
    <li key={item.title}>
      <Link key={item.path} to={LinkManager(item.path)}>
        <div className='list-item tooltip'>
          <span className='list-item-title tooltiptext'>{item.title}</span>
          <div dangerouslySetInnerHTML={{ __html: item.image }} />
        </div>
      </Link>
    </li>
  );
};

Card.propTypes = {
  item: PropTypes.object
};

export default ImageList;