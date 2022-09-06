import Header from '../../components/header.svelte';

window.onload = function () {
  console.log('Dynamic has been loaded', new Date());
  const target = document.createElement('div');
  const header = new Header({ target, props: { hello: 'san francisco' } });

  if (document.body.firstChild) document.body.insertBefore(target, document.body.firstChild);
};
