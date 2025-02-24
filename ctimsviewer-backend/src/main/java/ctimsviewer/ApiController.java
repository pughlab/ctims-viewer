package ctimsviewer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/check")
public class ApiController {

	@PreAuthorize("hasRole('ctimsuser')")
	@GetMapping(path = "/ctimsuser")
	public String users() {
		return "You have ctims user privilages";
	}
}
