import React from 'react';
import PropTypes from 'prop-types';

import './image.css';

const renditions = {
  '1900': 'web-optimized-xlarge.webp',
  '1200': 'web-optimized-large.webp',
  '900': 'web-optimized-medium.webp',
  '600': 'web-optimized-medium.webp'
};

const SrcSet = (src) => {
  
  const srcset = Object.keys(renditions).map((key) => (
    `${src}/jcr:content/renditions/${renditions[key]} ${key}w`
  ));

  return (srcset.join(', '));

};

const Image = ({ src }) => {
  return (
    <picture>
      <img src={`${src}/jcr:content/renditions/${renditions['1200']}`} srcSet={SrcSet(src)} />
    </picture>
  );
};

Image.propTypes = {
  src: PropTypes.string
};

SrcSet.propTypes = {
  src: PropTypes.string
};

export default Image;