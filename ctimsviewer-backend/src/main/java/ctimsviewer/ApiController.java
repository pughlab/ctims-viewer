package ctimsviewer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiController {

	@Value("${CTIMS_VIEWER_API_VERSION}")
    private String CTIMS_VIEWER_API_VERSION;

	@GetMapping(path = "/info")
	public String info() {
		return CTIMS_VIEWER_API_VERSION.toString();
	}
}
