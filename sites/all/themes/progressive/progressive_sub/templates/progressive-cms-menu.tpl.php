<?php $layout = _nikadevs_cms_get_active_layout();
$one_page = isset($layout['settings']['one_page']) && $layout['settings']['one_page'] ? 1 : 0; ?>
<?php if(theme_get_setting('header_top_menu') && !$one_page): global $user; ?>
  <div id="top-box">
    <div class="container">
    <div class="row">
      <div class="col-xs-9 col-sm-5">
		<div class="logo">
          <a href="<?php print url('<front>'); ?>">
           <img style="max-height:30px" src="<?php print theme_get_setting('logo'); ?>" class="logo-img" alt="">
          </a>
        </div>

      </div>
      
      <div class="col-xs-3 col-sm-7">
      <div class="navbar navbar-inverse top-navbar top-navbar-right" role="navigation">
        <button type="button" class="navbar-toggle btn-navbar collapsed" data-toggle="collapse" data-target=".top-navbar .navbar-collapse">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>

        <nav class="collapse collapsing navbar-collapse" style="width: auto;">
          <ul class="nav navbar-nav navbar-right">
            <?php
             	if(module_exists('tb_megamenu')) {
                    print theme('tb_megamenu', array('menu_name' => 'main-menu'));
                  }
                  else {
                    $main_menu_tree = module_exists('i18n_menu') ? i18n_menu_translated_tree(variable_get('menu_main_links_source', 'main-menu')) : menu_tree(variable_get('menu_main_links_source', 'main-menu'));
                    print drupal_render($main_menu_tree);
                  }
                ?>


            <?php if(theme_get_setting('account_login') && $user->uid): ?>
              <li><?php print l(t('My Account'), 'user'); ?></li>
            <?php endif; ?>
          
            <?php if(theme_get_setting('account_login') && !$user->uid): ?>
             <li><?php print l(t('Log In  <i class="fa fa-lock after"></i>'), 'user/login', array('html' => TRUE)); ?></li>
            <?php endif; ?>
          </ul>
        </nav>
      </div>
      </div>
    </div>
    </div>
  </div>
<?php endif; ?>

