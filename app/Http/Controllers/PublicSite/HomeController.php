<?php

namespace App\Http\Controllers\PublicSite;

use App\Http\Controllers\Controller;
use App\Models\ContentType;
use App\Models\Post;
use App\Models\Project;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function __invoke(Request $request): View
    {
        $cptProyectos = ContentType::where('slug', Project::TYPE_SLUG)->where('is_public', true)->first();
        $blogCpt = ContentType::where('slug', Post::TYPE_SLUG)->where('is_public', true)->first();

        $projects = Project::showcase(6)->get();
        $latestPosts = Post::latestEditorial(6)->get();

        return view('home', [
            'projects' => $projects,
            'featuredProjects' => $projects,
            'featuredContents' => $projects,
            'cptProyectos' => $cptProyectos,
            'latestPosts' => $latestPosts,
            'blogCpt' => $blogCpt,
        ]);
    }
}
