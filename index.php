<?php
define('DEPENDENCY_FILE', 'app.js');

define('APPPATH', __DIR__.'/');
define('MODULES', APPPATH.'modules/');

// Figure out the base path
define('BASE_PATH', dirname($_SERVER['SCRIPT_NAME']).'/');
?>
<!DOCTYPE html>
<html xmlns:ng="http://angularjs.org" ng:app="wp">
<head>
	<title ng:bind-template="{{contentModule}} | Warcraft Professional">Warcraft Professional</title>

	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

	<link rel="stylesheet" type="text/css" href="css/bootstrap.css">
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
	<script type="text/javascript" src="taffydb/taffy.js"></script>
	<script type="text/javascript" src="lib/bootstrap/js/bootstrap.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.3/angular.min.js"></script>
	<script type="text/javascript" src="js/modules.js"></script>

<?php

	function inlineJS($name, $file) {
		if( !file_exists($file) ) return;

	    $resolvedPath = str_replace(__DIR__, '', $file);
	    echo "<!-- BEGIN $name : $resolvedPath -->\n";
	    echo "<script type=\"text/javascript\" ";
	    echo "src=\"{$resolvedPath}\">\n";
	    echo "</script>\n";
	    echo "<!-- END   $name : $resolvedPath -->\n";
	}

	function loadModules(&$modules, $startDir=MODULES, $parentModule='wp') {
		if( substr($startDir,-1) != '/' ) {
			$startDir .= '/';
		}

		$dirs = @scandir( $startDir );
    if (!is_array($dirs)) return;
		foreach( $dirs as $subdir ) {
			if( $subdir == '.' || $subdir == '..' ) continue;
			$dir = $startDir.$subdir;
			if( !is_dir($dir) || file_exists($dir.'/exclude') ) continue;

			// Get all the js files
			$jsfiles = array();
			$jsfiledir = @scandir($dir.'/js');
			if( count($jsfiledir) > 2 ) { // more than just . and ..
				foreach( $jsfiledir as $file ) {
					if( $file == '.' || $file == '..' ) continue;
					$path = "{$startDir}{$subdir}/js/$file";
					$pathinfo = is_file($path) ? pathinfo($file) : FALSE;
					if( !empty($pathinfo['extension']) && $pathinfo['extension'] == 'js' ) {
						$jsfiles[] = $file;
					}
				}
			}

			// Now add the module to the master list
			if( $parentModule == 'wp' && $subdir == 'main' ) {
				$moduleName = 'wp';
			} else {
				$moduleName = $parentModule.'.'.$subdir;
			}

			$module = array('name'=>$moduleName,'dir'=>$dir,'js'=>$jsfiles,'parentModule'=>$parentModule);
			$modules[$module['name']] = $module;

			// Load up all the sub modules
			loadModules($modules, $dir.'/modules/', $moduleName);
		}
	}

	$modules = array();
	loadModules($modules);
	ksort($modules); // make sure the "sl" module is at the top

	echo "<!-- BEGIN Module Bootstrap Process -->\n";
	echo "<!-- BEGIN Dependency Resolution -->\n";
	foreach( $modules as $module ) {
		// Bootstrap each of the modules whether they asked to bootstrapped or not
		$moduleName = json_encode($module['name']);
		echo "<script type=\"text/javascript\">wp.require('wp',$moduleName);</script>".PHP_EOL;
		inlineJS($module['name'], "{$module['dir']}/js/".DEPENDENCY_FILE);
	}
	echo "<!-- END   Dependency Resolution -->\n\n";
	echo "<!-- BEGIN Module Definitions -->\n";
	foreach($modules as $module) {
		$modulename = $module['name'];
		echo "<script type=\"text/javascript\">\n";
		echo "angular.module('{$modulename}', wp.require('{$modulename}'));\n";
		echo "</script>\n";
	}
	echo "<!-- END   Module Definitions -->\n";
	echo "<!-- END   Module Bootstrap Process -->\n\n\n";

	foreach( $modules as $module ) {
		echo "<!-- BEGIN {$module['name']} Module Includes -->\n";
		foreach( $module['js'] as $js ) {
			if( $js == DEPENDENCY_FILE ) continue; // already got that one
			inlineJS($module['name'], "{$module['dir']}/js/$js");
		}
		echo "\n<!-- END   {$module['name']} Module Includes -->\n\n";
	}
?>
	<script type="text/javascript">
		angular.module('wp').run(function() { setTimeout(function() { console.log("wp run"); });
	</script>

</head>
<body>

	<div class="navbar navbar-fixed-top">
		<div class="navbar-inner">
			<div class="container">
				<a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</a>
				<a class="brand" href="#">Warcraft Professional</a>
				<div class="nav-collapse collapse">
					<ul class="nav">
						<li class="active"><a href="#">Home</a></li>
						<li class="dropdown">
							<a href="#" class="dropdown-toggle" data-toggle="dropdown">Professions <b class="caret"></b></a>
							<ul class="dropdown-menu">
								<li><a href="#">Alchemy</a></li>
								<li><a href="#">Blacksmithing</a></li>
								<li><a href="#">Cooking</a></li>
								<li><a href="#">Enchanting</a></li>
								<li><a href="#">Engineering</a></li>
								<li><a href="#">Inscription</a></li>
								<li><a href="#">Jewelcrafting</a></li>
								<li><a href="#">Leatherworking</a></li>
								<li><a href="#">Tailoring</a></li>
							</ul>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<div>Coming soon.</div>

</body>
</html>