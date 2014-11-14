<?php
/**
 * @file
 * Default theme implementation to display a node.
 *
 * Available variables:
 * - $title: the (sanitized) title of the node.
 * - $content: An array of node items. Use render($content) to print them all, or
 *   print a subset such as render($content['field_example']). Use
 *   hide($content['field_example']) to temporarily suppress the printing of a
 *   given element.
 * - $user_picture: The node author's picture from user-picture.tpl.php.
 * - $date: Formatted creation date. Preprocess functions can reformat it by
 *   calling format_date() with the desired parameters on the $created variable.
 * - $name: Themed username of node author output from theme_username().
 * - $node_url: Direct url of the current node.
 * - $terms: the themed list of taxonomy term links output from theme_links().
 * - $display_submitted: whether submission information should be displayed.
 * - $classes: String of classes that can be used to style contextually through
 *   CSS. It can be manipulated through the variable $classes_array from
 *   preprocess functions. The default values can be one or more of the following:
 *   - node: The current template type, i.e., "theming hook".
 *   - node-[type]: The current node type. For example, if the node is a
 *     "Blog entry" it would result in "node-blog". Note that the machine
 *     name will often be in a short form of the human readable label.
 *   - node-teaser: Nodes in teaser form.
 *   - node-preview: Nodes in preview mode.
 *   The following are controlled through the node publishing options.
 *   - node-promoted: Nodes promoted to the front page.
 *   - node-sticky: Nodes ordered above other non-sticky nodes in teaser listings.
 *   - node-unpublished: Unpublished nodes visible only to administrators.
 * - $title_prefix (array): An array containing additional output populated by
 *   modules, intended to be displayed in front of the main title tag that
 *   appears in the template.
 * - $title_suffix (array): An array containing additional output populated by
 *   modules, intended to be displayed after the main title tag that appears in
 *   the template.
 *
 * Other variables:
 * - $node: Full node object. Contains data that may not be safe.
 * - $type: Node type, i.e. story, page, blog, etc.
 * - $comment_count: Number of comments attached to the node.
 * - $uid: User ID of the node author.
 * - $created: Time the node was published formatted in Unix timestamp.
 * - $classes_array: Array of html class attribute values. It is flattened
 *   into a string within the variable $classes.
 * - $zebra: Outputs either "even" or "odd". Useful for zebra striping in
 *   teaser listings.
 * - $id: Position of the node. Increments each time it's output.
 *
 * Node status variables:
 * - $view_mode: View mode, e.g. 'full', 'teaser'...
 * - $teaser: Flag for the teaser state (shortcut for $view_mode == 'teaser').
 * - $page: Flag for the full page state.
 * - $promote: Flag for front page promotion state.
 * - $sticky: Flags for sticky post setting.
 * - $status: Flag for published status.
 * - $comment: State of comment settings for the node.
 * - $readmore: Flags true if the teaser content of the node cannot hold the
 *   main body content.
 * - $is_front: Flags true when presented in the front page.
 * - $logged_in: Flags true when the current user is a logged-in member.
 * - $is_admin: Flags true when the current user is an administrator.
 *
 * Field variables: for each field instance attached to the node a corresponding
 * variable is defined, e.g. $node->body becomes $body. When needing to access
 * a field's raw values, developers/themers are strongly encouraged to use these
 * variables. Otherwise they will have to explicitly specify the desired field
 * language, e.g. $node->body['en'], thus overriding any language negotiation
 * rule that was previously applied.
 *
 * @see template_preprocess()
 * @see template_preprocess_node()
 * @see template_process()
 */
unset($content['add_to_cart']['#form']['qty']['#title']);
$content['add_to_cart']['#form']['qty']['#attributes']['class'] = array('qty', 'text', 'input-text');
$content['add_to_cart']['#form']['qty']['#prefix'] = '<div class="quantity"><input type="button" value="-" class="minus">';
$content['add_to_cart']['#form']['qty']['#suffix'] = '<input type="button" value="+" class="plus"></div>';
?>
<div id="node-<?php print $node->nid; ?>" class="row <?php print $classes; ?>"<?php print $attributes; ?>>
  <div class="col-md-6">
    <!-- Project Slider -->
    <div class="owl-carousel owl-theme owl-slider thumbnail">
    <?php foreach(element_children($content['uc_product_image']) as $key): ?>
      <div class="item">
        <?php print render($content['uc_product_image'][$key]); ?>
      </div>
    <?php endforeach; ?>
    </div>
    <!-- Project Slider / End -->
  </div>
  <div class="col-md-6">
    <h2 class="product_title"><?php print $title; ?></h2>
    <p class="price">
      <?php if($old_price = render($content['field_old_price'])): ?>
        <del><span class="amount"><?php print variable_get('uc_currency_sign', '') . $old_price; ?></span></del>
      <?php endif; ?>
      <span class="amount"><?php print strip_tags(render($content['display_price'])); ?></span>
    </p>

    <div class="review_num">
      <span class="count" itemprop="ratingCount"><?php print $comment_count?></span> <?php print t('review' . ($comment_count == 1 ? '' : 's')); ?>
    </div>

    <?php print render($content['field_rating']); ?>

    <hr>

    <?php print render($content['field_main_description']); ?>
	<?php print render($content['field_audio']); ?>
      </div>
    <div class="buttons_added">
      <?php print render($content['add_to_cart']); ?>
    </div>
      <?php print render($content['field_button_link']); ?>
      </div>
      

    <div class="spacer"></div>

    <div class="product_meta">
      <span class="sku_wrapper">
        <?php print strip_tags(render($content['model'])); ?>.
      </span>
      <span class="posted_in">
        <?php print strip_tags(render($content['field_catalog']), '<a>'); ?>
      </span>
      <span class="tagged_as">
        <?php print strip_tags(render($content['field_tags']), '<a>'); ?>
      </span>
    </div>

  </div>
</div>

<div class="spacer xl"></div>

<div class="tabs">
  <!-- Nav tabs -->
  <ul class="nav nav-tabs">
    <li class="active"><a href="#reviews-tab-1" data-toggle="tab"><?php print t('Description'); ?></a></li>
    <li><a href="#reviews-tab-2" data-toggle="tab"><?php print t('Additional Information'); ?></a></li>
    <li><a href="#reviews-tab-3" data-toggle="tab"><?php print t('Reviews (' . $comment_count . ')'); ?></a></li>
  </ul>

  <!-- Tab panes -->
  <div class="tab-content">
    <div class="tab-pane fade in active" id="reviews-tab-1">
      <?php print render($content['body']); ?>
    </div>
    <div class="tab-pane fade" id="reviews-tab-2">
      <div class="table-responsive">
        <?php
          unset($content['field_main_description'], $content['field_rating'], $content['field_tags'], $content['field_catalog']);
          $rows = array();
          foreach($content as $key => $field){
            if(strpos($key, 'field') !== FALSE){
              $title = $content[$key]['#title'];
              $content[$key]['#title'] = '';
              $rows[] = array($title, render($content[$key]));
            }
          }
          $weight = render($content['weight']);
          if($weight) {
            $rows[] = array(t('Weight'), $weight);
          }
          $dimensions = render($content['dimensions']);
          if($dimensions) {
            $rows[] = array(t('Dimensions'), $dimensions);
          }
          print theme('table', array('rows' => $rows, 'attributes' => array('class' => array('table table-striped'))));
        ?>
      </div>
    </div>
    <div class="tab-pane fade product-comments" id="reviews-tab-3">
      <?php print render($content['comments']); ?>
    </div>
  </div>
</div>

<hr class="lg">
