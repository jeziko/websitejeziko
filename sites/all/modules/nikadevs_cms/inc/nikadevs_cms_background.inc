<?php

function nikadevs_cms_background($form, &$form_state) {
  if(function_exists('media_wysiwyg_include_browser_js')) {
    include_once drupal_get_path('module', 'media') . '/modules/media_wysiwyg/wysiwyg_plugins/media.inc';
    media_wysiwyg_include_browser_js();
  }
  else {
    include_once drupal_get_path('module', 'media') . '/wysiwyg_plugins/media.inc';
    media_include_browser_js();
  }
  drupal_add_js(drupal_get_path('module', 'nikadevs_cms') . '/js/nikadevs-cms-background.js');
  $form['items'] = array(
    '#tree' => TRUE,
    '#theme' => 'nikadevs_cms_background_table',
    '#prefix' => '<div id = "backgrounds-table">',
    '#suffix' => '</div>'
  );
  // If the form rebuilded by AHAH then get ordered list of items from POST
  if (isset($form_state['values']['items'])) {
    $settings = $form_state['values']['items'];
  }
  else {
    $settings = variable_get('nikadevs_cms_background_' . variable_get('theme_default', ''), array());
  }
  if ($settings != array()) {
    foreach ($settings as $id => $item) {
      $form['items'][$id] = nikadevs_cms_background_row($item);
    }
  }
  if (isset($form_state['values']['add_new'])) {
    $form['items'][] = nikadevs_cms_background_row();
  }
  $form['add_new'] = array(
    '#type' => 'submit',
    '#value' => t('Add new item'),
    '#submit' => array('nikadevs_cms_ajax_background_add_one'),
    '#ajax' => array(
      'callback' => 'nikadevs_cms_ajax_background_callback',
      'wrapper' => 'backgrounds-table',
      'effect' => 'fade',
      'method' => 'replace',
    )
  );
  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save'),
    '#prefix' => '<br class = "clear"/>'
  );
  return $form;
}

function nikadevs_cms_background_submit($form, &$form_state) {
  foreach($form_state['values']['items'] as $i => $item) {
    if($item['delete']) {
      unset($form_state['values']['items'][$i]);
      if($item['fid'] && $file = file_load($item['fid'])) {
        file_delete($file);
      }
    }
  }
  variable_set('nikadevs_cms_background_' . variable_get('theme_default', ''), $form_state['values']['items']);
}

function nikadevs_cms_background_row($item = array()) {
  $row =  array(
    'pages' => array(
      '#type' => 'textarea',
      '#rows' => 3,
      '#default_value' => isset($item['pages']) ? $item['pages'] : '',
      '#attributes' => array('class' => array('background-pages')),
    ),
    'fid' => array(
      '#type' => 'textfield',
      '#default_value' => isset($item['fid']) ? $item['fid'] : 0,
      '#attributes' => array('style' => array('display:none;')),
    ),
    'blur' => array(
      '#type' => 'textfield',
      '#default_value' => isset($item['blur']) ? $item['blur'] : 0,
      '#description' => t('Example: 0.5'),
      '#size' => 3
    ),
    'delete' => array(
      '#type' => 'checkbox',
      '#default_value' => isset($item['delete']) ? $item['delete'] : 0,
    )
  );
  return $row;
}

function nikadevs_cms_ajax_background_callback($form, $form_state) {
  return $form['items'];
}

/**
 * Submit handler for add new item
 */
function nikadevs_cms_ajax_background_add_one($form, &$form_state) {
  $form_state['rebuild'] = TRUE;
}

function theme_nikadevs_cms_background_table($form) {
  $header = array(t('Pages'), t('Background'), t('Upload New Image'), t('Blur'), t('Delete'));
  $rows = array();
  $output = '';
  foreach (element_children($form['form']) as $key) {
    $element = &$form['form'][$key];
    $row = array(render($element['pages']));
    $image = $element['fid']['#default_value'] ? '<div class = "media-item">' . theme('image_style', array('style_name' => 'media_thumbnail', 'path' => file_load($element['fid']['#default_value'])->uri)) . '</div>': '';
    $row[] = '<div class = "bg-image-preview" style = "float:left;">' . $image . '</div>' . render($element['fid']);
    $row[] = '<a class="button upload_bg_image" href="#">Select Image</a>';
    $row[] = render($element['blur']);
    $row[] = render($element['delete']);
    $rows[] = $row;
  }
  $output .= theme('table', array('rows' => $rows, 'header' => $header));
  return $output;  
}


/**
 * Implementation of hook_preprocess_html().
 */
function nikadevs_cms_preprocess_html(&$variables) {
  $settings = variable_get('nikadevs_cms_background_' . variable_get('theme_default', ''), array());
  foreach($settings as $setting) {
    if(!empty($setting['pages'])) {
      $pages = drupal_strtolower($setting['pages']);
      // Convert the Drupal path to lowercase
      $path = drupal_strtolower(drupal_get_path_alias($_GET['q']));
      // Compare the lowercase internal and lowercase path alias (if any).
      $page_match = drupal_match_path($path, $pages);
      if ($path != $_GET['q']) {
        $page_match = $page_match || drupal_match_path($_GET['q'], $pages);
      }
      // If match found - use this layout
      if($page_match) {
        $image = file_create_url(file_load($setting['fid'])->uri);
        $css = "background-image: url('" . $image . "') !important;
          background-repeat: no-repeat;
          background-position: center top;
          -webkit-background-size: cover;
          background-size: cover;
        ";
        if($setting['blur']) {
          drupal_add_css(drupal_get_path('module', 'nikadevs_cms') . '/css/nikadevs_cms_background.css');
          drupal_add_js(drupal_get_path('module', 'nikadevs_cms') . '/js/pixastic.custom.js');
          $variables['classes_array'][] = 'blur-page';
          $variables['attributes_array']['data-blur-amount'] = $setting['blur'];
          $variables['attributes_array']['data-blur-image'] = $image;
        }else {
          $variables['classes_array'][] = 'body-background';
          drupal_add_css('body{' . $css . '}', array('type' => 'inline'));
        }
        return $css;
      }
    }
  }
}