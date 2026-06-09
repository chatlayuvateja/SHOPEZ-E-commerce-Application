import { useEffect } from 'react';

const SEOHead = ({ title, description, keywords }) => {
  useEffect(() => {
    const baseTitle = 'ShopEZ';
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;
  }, [title]);

  useEffect(() => {
    if (!description) return;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
    return () => {
      if (metaDesc && metaDesc.parentNode) {
        metaDesc.parentNode.removeChild(metaDesc);
      }
    };
  }, [description]);

  useEffect(() => {
    if (!keywords) return;
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);
    return () => {
      if (metaKeywords && metaKeywords.parentNode) {
        metaKeywords.parentNode.removeChild(metaKeywords);
      }
    };
  }, [keywords]);

  return null;
};

export default SEOHead;
